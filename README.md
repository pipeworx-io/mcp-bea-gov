# @pipeworx/bea-gov

[BEA — Bureau of Economic Analysis](https://apps.bea.gov/api/signup/) MCP — US national + regional + industry + international econ stats. Free key (email signup).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Auth

- Platform: `PLATFORM_BEA_KEY`. BYO: `?_apiKey=…`.

## Tools

- `dataset_list()` — list datasets
- `parameter_list(dataset)` — parameters for a dataset
- `parameter_values(dataset, parameter)` — valid values for a parameter
- `parameter_values_filtered(dataset, target_parameter, ...filters)` — filter-aware valid values (rare; pass other params as filters)
- `get_data(dataset, ...params)` — actual data (params per dataset; e.g. `TableName`, `Frequency`, `Year`, `GeoFips`, `LineCode`)

`dataset` examples: `NIPA`, `NIUnderlyingDetail`, `MNE`, `FixedAssets`, `ITA`, `IIP`, `InputOutput`, `IntlServTrade`, `GDPbyIndustry`, `Regional`, `UnderlyingGDPbyIndustry`, `APIDatasetMetadata`.

## Data source

`https://apps.bea.gov/api/data`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "bea-gov": {
      "url": "https://gateway.pipeworx.io/bea-gov/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Bea Gov data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
