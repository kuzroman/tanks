const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const ip = require("ip");

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.(sc|sa|c)ss$/,
                oneOf: [
                    {
                        use: [
                            MiniCssExtractPlugin.loader,
                            { loader: 'css-loader' },
                            'sass-loader',
                        ]
                    }
                ]
            },
            {
                test: /\.svg$/,
                exclude: /\.raw\./,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash:8].[ext]',
                        }
                    },
                    {
                        loader: 'svgo-loader',
                    },
                    {
                        loader: 'svg-transform-loader',
                    }
                ]
            },
        ],
    },
    devServer: {
        inline: false,
        progress: true,
        disableHostCheck: true,
        compress: true,
        contentBase: [
            path.resolve(__dirname, 'static'),
        ],
        watchOptions: {
            aggregateTimeout: 1000,
            ignored: /[\\/]node_modules[\\/]/
        }
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            IP: JSON.stringify(ip.address()),
        })
    ],
};