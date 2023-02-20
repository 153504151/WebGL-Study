const path = require("path");
module.exports = {
	entry: "./src/main.ts",
	mode: "production",
	output: {
		path: path.resolve(__dirname, "dist/release"),
		filename: "main.js",
		library: { 
			type: 'commonjs2',
		},
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [{
					loader: "babel-loader",
					options: {
						presets: [
							[
								"@babel/preset-env",
								{
									targets: {
										"chrome": "104"
									}
								}
							],
							["@babel/preset-typescript"]
						],
						plugins: ["@babel/transform-runtime"]
					}
				}],
				exclude: /(node_modules|bower_components)/
			},
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /(node_modules|bower_components)/,
				options: {
					transpileOnly: true // 只做语言转换，而不做类型检查
				}
			},
		]
	},
};