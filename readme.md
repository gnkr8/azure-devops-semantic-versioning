# Semantic versioning

This extension makes it easy to change the default build numbering to semantic versioning using ([gittools/gitversion](https://github.com/gittools/gitversion)).

```yaml
steps:
- task: SemanticVersioning@1
  inputs:
    # https://gitversion.readthedocs.io/en/latest/configuration/
    configFile: '.semver.yml'
- script: "echo $(Build.BuildNumber)"
```

