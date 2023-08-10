#natours app for learning Node.js

Natours app is a web application for booking tours, where users can register, write reviews, book tours and so on.

Technologies used: Node, Express, MongoDB, Mongoose

"dependencies": {
"@babel/polyfill": "^7.12.1" -- adds support to the web browsers for features, which are not available. Babel compiles the code from recent ecma version to the one, which we want.

    "axios": "^0.27.2", -- Axios is a promised-based HTTP client for JavaScript. It has the ability to make HTTP requests from the browser and handle the transformation of request and response data. (Call API-s from the front)

    "bcryptjs": "^2.4.3" --  This module enables storing of passwords as hashed passwords instead of plaintext.

    "compression": "^1.7.4", -- decreases the downloadable amount of data that's served to users. Through the use of this compression, we can improve the performance of our Node. js applications as our payload size is reduced drastically.

    "cookie-parser": "^1.4.6", -- cookie-parser is a middleware which parses cookies attached to the client request object. To use it, we will require it in our index. js file; this can be used the same way as we use other middleware. (might be no longer needed)

    "cors": "^2.8.5", -- Cross-origin resource sharing (CORS) is a mechanism that allows restricted resources on a web page to be requested from another domain outside the domain ...

    "cron": "^2.0.0", -- Cron is a tool that allows you to execute something on a schedule. This is typically done using the cron syntax. We allow you to execute a function whenever your scheduled job triggers. (not yet implemented)

    "dotenv": "^16.0.1", -- DotEnv is a lightweight npm package that automatically loads environment variables from a . env file into the process. env object.


    "express": "^4.18.1", -- Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

    "express-async-errors": "^3.1.1", - If synchronous code throws an error, then Express will catch and process it." But, for async: "For errors returned from asynchronous functions invoked by route handlers and middleware, you must pass them to the next() function, where Express will catch and process them.

    "express-mongo-sanitize": "^2.2.0", -- Express 4.x middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection. (for security)

    "express-rate-limit": "^6.4.0", --  Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.

    "helmet": "^3.23.3", --  Helmet.js fills in the gap between Node.js and Express.js by securing HTTP headers that are returned by your Express apps. (security)

    "hpp": "^0.2.3", -- Express middleware to protect against HTTP Parameter Pollution attacks. (security)

    "html-to-text": "^8.2.0", --  Advanced html to plain text converter. I use it to convert email htmls to plain text.

    "jsonwebtoken": "^8.5.1", --  The JSON web token (JWT) allows you to authenticate your users, without actually storing any information about them on the system itself

    "mongoose": "^6.3.4", --  Mongoose acts as a front end to MongoDB, an open source NoSQL database that uses a document-oriented data model. Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building,

    "morgan": "^1.10.0", -- morgan is a Node. js and Express middleware to log HTTP requests and errors, and simplifies the process.

    "multer": "^1.4.5-lts.1", -- Multer is a node.js middleware for handling multipart/form-data , which is primarily used for uploading files.

    "nodemailer": "^6.7.5", --  Easy as cake e-mail sending from your Node.js applications.

    "nodemon": "^2.0.16", -- nodemon is a tool that helps develop node. js based applications by automatically restarting the node application when file changes in the directory are detected.

    "process": "^0.11.10", -- The process object in Node. js is a global object that can be accessed inside any module without requiring it. There are very few global objects or properties provided in Node. js and process is one of them. It is an essential component in the Node

    "pug": "^3.0.2", -- Pug is a JavaScript template engine. Used for server side rendering and sending email templates.

    "qrcode": "^1.5.0", --  QR Code Generator (uses Speakeasy generated secret)

    "redis": "^4.1.0", -- Redis is a super fast and efficient in-memory, key–value cache and store. It's also known as a data structure server, as the keys can contain strings, lists, sets, hashes and other data structures. Redis is best suited to situations that require data to be retrieved and delivered to the client as quickly as possible. (not implemented in this project)

    "sharp": "^0.30.6", -- igh performance Node.js image processing, the fastest module to resize JPEG, PNG, WebP, GIF, AVIF and TIFF images.

    "slugify": "^1.6.5", -- create slug names

    "speakeasy": "^2.0.0", --  Speakeasy is a one-time passcode generator, ideal for use in two-factor authentication, that supports Google Authenticator and other two-factor authenthicator

    "stripe": "^9.8.0", -- Stripe is a suite of APIs powering online payment processing and commerce solutions for internet businesses of all sizes. Accept payments and scale faster.

    "validator": "^13.7.0", --A library of string validators and sanitizers. (not used in project anymore)

    "xss-clean": "^0.1.1" -- xss is a module used to filter input from users to prevent XSS attacks.

    "Path": --Extract the filename from a file path: ... The Path module provides a way of working with directories and file paths.

    "crypto": -- Using for reset password and other session based tokens. Crypto is a module in Node.js which deals with an algorithm that performs data encryption and decryption. This is used for security purpose like user authentication where storing the password in Database in the encrypted form.
