import stylisticJsPlugin from "@stylistic/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import globalsPlugin from "globals";

const config = [
    {
        ignores: []
    },
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            globals: {
                ...globalsPlugin.node
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: false
                }
            }
        },
        plugins: {
            "@stylistic/js": stylisticJsPlugin,
            import: importPlugin
        },
        rules: {
            "no-undef": "error",
            "no-var": "error",
            "no-object-constructor": "error",
            "no-multi-spaces": "error",
            "no-irregular-whitespace": "error",
            "no-constant-condition": "error",
            "no-extra-boolean-cast": "error",
            "no-unreachable": "error",
            "no-useless-return": "error",
            "no-else-return": "error",
            "no-empty-function": "error",
            "no-empty-pattern": "error",
            "no-duplicate-imports": "error",
            "no-import-assign": "error",
            "no-implicit-globals": "error",
            "no-duplicate-case": "error",
            "no-fallthrough": "error",
            "no-undef-init": "error",
            "no-useless-catch": "error",
            "no-useless-concat": "error",
            "no-useless-escape": "error",
            "no-useless-rename": "error",
            "no-useless-constructor": "error",
            "comma-dangle": ["error", "never"],
            "prefer-arrow-callback": "error",
            "prefer-const": "error",
            eqeqeq: "error",
            curly: "error",
            semi: ["error", "always"],
            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ],
            "space-before-function-paren": [
                "error",
                {
                    anonymous: "never",
                    named: "never",
                    asyncArrow: "always"
                }
            ],
            "sort-imports": [
                "error",
                {
                    ignoreDeclarationSort: true
                }
            ],

            "import/named": "error",
            "import/default": "error",
            "import/namespace": "error",
            "import/first": "error",
            "import/order": [
                "error",
                {
                    groups: ["external", "internal"],
                    pathGroups: [
                        {
                            pattern: "./routes/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "./lib/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "./utils/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "../routes/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "../lib/**",
                            group: "internal",
                            position: "after"
                        },
                        {
                            pattern: "../utils/**",
                            group: "internal",
                            position: "after"
                        }
                    ],
                    pathGroupsExcludedImportTypes: [],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true
                    }
                }
            ],

            "@stylistic/js/keyword-spacing": ["error", { after: true }],
            "@stylistic/js/max-len": [
                "error",
                {
                    code: 150,
                    ignoreTemplateLiterals: true
                }
            ],
            "@stylistic/js/linebreak-style": ["error", "unix"],
            "@stylistic/js/arrow-spacing": "error",
            "@stylistic/js/quotes": ["error", "double"],
            "@stylistic/js/space-before-blocks": ["error", "always"],
            "@stylistic/js/space-infix-ops": "error",
            "@stylistic/js/space-in-parens": ["error", "never"],
            "@stylistic/js/space-unary-ops": "error",
            "@stylistic/js/spaced-comment": ["error", "always"],
            "@stylistic/js/no-mixed-spaces-and-tabs": "error",
            "@stylistic/js/no-extra-semi": "error",
            "@stylistic/js/object-curly-spacing": [
                "error",
                "always",
                {
                    arraysInObjects: true,
                    objectsInObjects: true
                }
            ],
            "@stylistic/js/no-multiple-empty-lines": [
                "error",
                {
                    max: 1
                }
            ]
        }
    }
];

export default config;
