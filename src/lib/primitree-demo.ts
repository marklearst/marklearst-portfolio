/** Recorded output from the real Primitree CLI. Regenerate with primitree-demo.generate.mjs. */
export const PRIMITREE_DEMO = {
  "provenance": {
    "repository": "https://github.com/marklearst/primitree",
    "commit": "d0c599960434b68e7b1b72439780ebcac37c0b0f",
    "package": "@primitree/cli",
    "version": "1.0.0-next.1",
    "node": "v26.8.2",
    "commands": [
      "primitree check --format json",
      "primitree build"
    ],
    "outputNormalization": "Temporary fixture directory replaced with <fixture>. All other CLI output preserved.",
    "builtFileSha256": {
      "@primitree/cli/index": "59f50e711e68fee42e2b8baf74efc288a0a217eef18518a80b42e999aeeaabe9",
      "@primitree/core/index": "47fc4dbde14551e1c0325d46cf4417e373eee9828d5e0fbd1f6d541654881627",
      "@primitree/core/policy": "ad5d0e2991bc2fea979bd191749deab97e47bb6285f825f51b84d095f0d25fbc",
      "@primitree/dtcg/index": "5b75033fc3ef4f44b76e19bcae678fcb3e61c152904d950a9c24b4294df8faff"
    }
  },
  "config": {
    "schemaVersion": 1,
    "sources": {
      "brand": {
        "type": "dtcg",
        "file": "./tokens.json",
        "architecture": {
          "layers": [
            {
              "id": "base",
              "roots": [
                "color"
              ],
              "values": "literal"
            },
            {
              "id": "meaning",
              "roots": [
                "semantic"
              ],
              "values": "reference",
              "references": [
                "base"
              ]
            }
          ]
        },
        "ownership": {
          "default": [
            "design-systems"
          ]
        },
        "outputs": {
          "directory": "./generated",
          "formats": [
            "css"
          ]
        }
      }
    }
  },
  "configSource": "export default {\n  \"schemaVersion\": 1,\n  \"sources\": {\n    \"brand\": {\n      \"type\": \"dtcg\",\n      \"file\": \"./tokens.json\",\n      \"architecture\": {\n        \"layers\": [\n          {\n            \"id\": \"base\",\n            \"roots\": [\n              \"color\"\n            ],\n            \"values\": \"literal\"\n          },\n          {\n            \"id\": \"meaning\",\n            \"roots\": [\n              \"semantic\"\n            ],\n            \"values\": \"reference\",\n            \"references\": [\n              \"base\"\n            ]\n          }\n        ]\n      },\n      \"ownership\": {\n        \"default\": [\n          \"design-systems\"\n        ]\n      },\n      \"outputs\": {\n        \"directory\": \"./generated\",\n        \"formats\": [\n          \"css\"\n        ]\n      }\n    }\n  }\n}\n",
  "scenarios": [
    {
      "id": "literal",
      "tokens": {
        "color": {
          "cyan": {
            "$type": "color",
            "$value": {
              "colorSpace": "srgb",
              "components": [
                0.2,
                0.8,
                1
              ],
              "hex": "#33CCFF"
            }
          }
        },
        "semantic": {
          "action": {
            "$type": "color",
            "$value": {
              "colorSpace": "srgb",
              "components": [
                0.2,
                0.8,
                1
              ],
              "hex": "#33CCFF"
            }
          }
        }
      },
      "tokensSource": "{\n  \"color\": {\n    \"cyan\": {\n      \"$type\": \"color\",\n      \"$value\": {\n        \"colorSpace\": \"srgb\",\n        \"components\": [\n          0.2,\n          0.8,\n          1\n        ],\n        \"hex\": \"#33CCFF\"\n      }\n    }\n  },\n  \"semantic\": {\n    \"action\": {\n      \"$type\": \"color\",\n      \"$value\": {\n        \"colorSpace\": \"srgb\",\n        \"components\": [\n          0.2,\n          0.8,\n          1\n        ],\n        \"hex\": \"#33CCFF\"\n      }\n    }\n  }\n}\n",
      "check": {
        "exitCode": 1,
        "stdout": "{\"schemaVersion\":1,\"command\":\"check\",\"source\":\"brand\",\"findings\":[{\"findingId\":\"PT1003:source%3Abrand%2Ftoken%3Asemantic.action\",\"ruleId\":\"PT1003\",\"tokenId\":\"source:brand/token:semantic.action\",\"path\":[\"semantic\",\"action\"],\"message\":\"Layer meaning does not allow this token value form.\",\"owners\":[\"design-systems\"],\"disposition\":\"active\",\"layerId\":\"meaning\"}],\"summary\":{\"active\":1,\"baseline\":0}}\n",
        "stderr": ""
      },
      "checkReport": {
        "schemaVersion": 1,
        "command": "check",
        "source": "brand",
        "findings": [
          {
            "findingId": "PT1003:source%3Abrand%2Ftoken%3Asemantic.action",
            "ruleId": "PT1003",
            "tokenId": "source:brand/token:semantic.action",
            "path": [
              "semantic",
              "action"
            ],
            "message": "Layer meaning does not allow this token value form.",
            "owners": [
              "design-systems"
            ],
            "disposition": "active",
            "layerId": "meaning"
          }
        ],
        "summary": {
          "active": 1,
          "baseline": 0
        }
      },
      "build": {
        "exitCode": 1,
        "stdout": "",
        "stderr": "PT1003 semantic.action: Layer meaning does not allow this token value form.\nBuild stopped with 1 active finding for source \"brand\".\n"
      },
      "files": [],
      "css": null
    },
    {
      "id": "reference",
      "tokens": {
        "color": {
          "cyan": {
            "$type": "color",
            "$value": {
              "colorSpace": "srgb",
              "components": [
                0.2,
                0.8,
                1
              ],
              "hex": "#33CCFF"
            }
          }
        },
        "semantic": {
          "action": {
            "$type": "color",
            "$value": "{color.cyan}"
          }
        }
      },
      "tokensSource": "{\n  \"color\": {\n    \"cyan\": {\n      \"$type\": \"color\",\n      \"$value\": {\n        \"colorSpace\": \"srgb\",\n        \"components\": [\n          0.2,\n          0.8,\n          1\n        ],\n        \"hex\": \"#33CCFF\"\n      }\n    }\n  },\n  \"semantic\": {\n    \"action\": {\n      \"$type\": \"color\",\n      \"$value\": \"{color.cyan}\"\n    }\n  }\n}\n",
      "check": {
        "exitCode": 0,
        "stdout": "{\"schemaVersion\":1,\"command\":\"check\",\"source\":\"brand\",\"findings\":[],\"summary\":{\"active\":0,\"baseline\":0}}\n",
        "stderr": ""
      },
      "checkReport": {
        "schemaVersion": 1,
        "command": "check",
        "source": "brand",
        "findings": [],
        "summary": {
          "active": 0,
          "baseline": 0
        }
      },
      "build": {
        "exitCode": 0,
        "stdout": "Built 2 files for source \"brand\" in <fixture>/generated.\n",
        "stderr": ""
      },
      "files": [
        ".primitree-manifest.json",
        "css/tokens.css"
      ],
      "css": "/* @primitree/dtcg CSS output. :root contains default contexts. Set data attributes to switch themes, for example <html data-semantic=\"dark\">. */\n\n:root {\n  --color-cyan: color(srgb 0.2 0.8 1);\n  --semantic-action: var(--color-cyan);\n}\n"
    }
  ]
} as const
