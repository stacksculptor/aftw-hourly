# Sharetribe Flex Template for Web

[![CircleCI](https://circleci.com/gh/sharetribe/flex-template-web.svg?style=svg&circle-token=198451e83e5cecb0d662949260dbc3273ac44a67)](https://circleci.com/gh/sharetribe/flex-template-web)

This is a template web application for a Sharetribe Flex marketplace ready to be extended and
customized. It is based on an application bootstrapped with
[create-react-app](https://github.com/facebookincubator/create-react-app) with some additions,
namely server side rendering and a custom CSS setup.

## Quick start

If you just want to get the app running quickly to test it out, first install
[Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/), and follow along:

```sh
git clone git@github.com:sharetribe/sharetribe-starter-app.git # clone this repository
cd sharetribe-starter-app/                                     # change to the cloned directory
cp .env-template .env                                          # copy the env template file to add your local config
emacs .env                                                     # in your favorite editor, add the mandatory env vars to the config
yarn install                                                   # install dependencies
yarn run dev                                                   # start the dev server, this will open a browser in localhost:3000
```

See the [Environment configuration variables](docs/env.md) documentation for more information of the
required configuration variables.

**Note:** If you want to build your own Flex marketplace on top of the template, you should fork the
repository instead of cloning it. See the [Customization guide](./docs/customization-guide.md).

## Getting started with your own customization

If you want to build your own Flex marketplace by customizing the template application, see the
[Customization guide](docs/customization-guide.md) documentation.

## Documentation

Full documentation can be found in the [docs directory](docs/).

## License

This project is licensed under the terms of the Apache-2.0 license.

See [LICENSE](LICENSE)
