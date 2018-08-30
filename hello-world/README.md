# KNoT Hello World App

This is a minimalist webapp built with Node.js/Express and React.
You can use it as an example to create your customized app to interact with
your KNoT Things.

This example was created to work with the HelloWorld example available at the
[KNoT Thing repository](https://github.com/CESARBR/knot-thing-source/tree/master/examples/HelloWorld)

In order to run:
```
$ cd cloud/backend
$ npm install (or yarn install)
$ npm start (or yarn start)
```
This will start the backend API on port 3003.
If you want to use another port make sure to change the proxy property on the
package.json inside the frontend folder

Open another terminal and run the following commands:
```
$ cd cloud/frontend
$ npm install (or yarn install)
$ npm start (or yarn start)
```

This will start the frontend on port 3002