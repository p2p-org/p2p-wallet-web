module.exports = {
    "./src/**/*.{js,jsx,ts,tsx}": [
        "pretty-quick --staged",
        "eslint"
    ],
    "*.{tsx,ts}": [
        "bash -c tsc --noEmit --emitDeclarationOnly false --project ./tsconfig.json"
    ]
}
