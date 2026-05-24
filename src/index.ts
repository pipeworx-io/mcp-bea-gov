interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * BEA — Bureau of Economic Analysis MCP.
 */


const BASE = 'https://apps.bea.gov/api/data';
const UA = 'pipeworx-mcp-bea-gov/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  { name: 'dataset_list', description: 'List datasets.', inputSchema: { type: 'object', properties: {} } },
  { name: 'parameter_list', description: 'Parameters for a dataset.', inputSchema: { type: 'object', properties: { dataset: { type: 'string' } }, required: ['dataset'] } },
  {
    name: 'parameter_values',
    description: 'Valid values for a parameter.',
    inputSchema: { type: 'object', properties: { dataset: { type: 'string' }, parameter: { type: 'string' } }, required: ['dataset', 'parameter'] },
  },
  {
    name: 'parameter_values_filtered',
    description: 'Filter-aware valid values.',
    inputSchema: { type: 'object', properties: { dataset: { type: 'string' }, target_parameter: { type: 'string' } }, required: ['dataset', 'target_parameter'], additionalProperties: true },
  },
  {
    name: 'get_data',
    description: 'Actual data (params per dataset).',
    inputSchema: { type: 'object', properties: { dataset: { type: 'string' } }, required: ['dataset'], additionalProperties: true },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('BEA requires a UserID. Set PLATFORM_BEA_KEY or pass ?_apiKey=… (free at https://apps.bea.gov/api/signup/).');
  const get = async (params: Record<string, unknown>) => {
    const p = new URLSearchParams({ UserID: apiKey, ResultFormat: 'json' });
    for (const [k, v] of Object.entries(params)) if (k !== '_apiKey' && v != null) p.set(k, String(v));
    const res = await fetch(`${BASE}?${p}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (!res.ok) throw new Error(`BEA: ${res.status}`);
    const j = (await res.json()) as { BEAAPI?: { Error?: { APIErrorDescription?: string } } };
    const err = j?.BEAAPI?.Error;
    if (err) throw new Error(`BEA: ${err.APIErrorDescription ?? 'API error'}`);
    return j;
  };
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  switch (name) {
    case 'dataset_list':
      return get({ method: 'GETDATASETLIST' });
    case 'parameter_list':
      return get({ method: 'GETPARAMETERLIST', DataSetName: reqStr('dataset', '"NIPA"') });
    case 'parameter_values':
      return get({ method: 'GETPARAMETERVALUES', DataSetName: reqStr('dataset', '"NIPA"'), ParameterName: reqStr('parameter', '"TableName"') });
    case 'parameter_values_filtered': {
      const rest: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(args)) {
        if (k === '_apiKey' || k === 'dataset' || k === 'target_parameter') continue;
        if (v != null) rest[k] = v;
      }
      return get({ method: 'GetParameterValuesFiltered', DataSetName: reqStr('dataset', '"NIPA"'), TargetParameter: reqStr('target_parameter', '"TableName"'), ...rest });
    }
    case 'get_data': {
      const rest: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(args)) {
        if (k === '_apiKey' || k === 'dataset') continue;
        if (v != null) rest[k] = v;
      }
      return get({ method: 'GETDATA', DataSetName: reqStr('dataset', '"NIPA"'), ...rest });
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
