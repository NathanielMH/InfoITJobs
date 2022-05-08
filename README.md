# InfoITJobs - HackUPC 2022
Hack UPC 2022 Project

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![Angular.js](https://img.shields.io/badge/angular.js-%23E23237.svg?style=for-the-badge&logo=angularjs&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%23563D7C.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

## Objective
There are tons of jobs in IT and for professionals looking for a position, it may definitely get a bit overwhelming. By relating a huge database of jobs such as Infojobs more directly to prospective applicants, we believe we can provide smooth and efficient experience for both the contractors and the people looking for jobs.

This repository contains:

1. ✅ Given a list with a user's skills, it produces an ordered list of suitable IT jobs obtained from the Infojobs api. Due to inconsistence in the database, this cannot be done, but we can recommend a specific IT job category based on the user's skills, all served on an intuitive and easy to use website.

2. 🕒 The user an input the skills in a multiple select dropdown menu on the frontend.

3. 🕒 The user can search for IT jobs according to relevant criteria, such as experience needed, location, salary and categories.


## Table of Contents

- [Background](#background)
- [Install](#install)
- [Development server](#development_server)
- [Code Scaffolding](#badge)
- [Build](#example-readmes)
- [Running unit tests](#related-efforts)
- [Running end-to-end tests](#maintainers)
- [License](#license)

## How we built it

We adapted the Bullhorn-staffing dashboard API for hosting IT jobs. We chose it mainly due to its modern appearance and its implementation in Angular.js, because we value its wide adoption and the availability of libraries, that allowed us to create a demo to improve upon using explained ideas. In parallel, we started working on the recommendation algorithm and its implementation in Python using heaps.

To better understand the API, we used the curl command and Postman to perform 'GET' http requests. After failing to integrate it with Angular.js, we implemented a Python backend using the fastapi library.

We started building a form for users to input their skills and obtain recommendations by the algorithm.

We designed the search algorithm both for the actual dataset and the hypothetical uniform one in Python, the latter providing better search experience as it recommends jobs directly.


## Install

This project uses [node](http://nodejs.org) and [npm](https://npmjs.com). Go check them out if you don't have them locally installed.

```sh
$ nvm install v16.13.1
$ nvm use v16.13.1
$ npm install
```

The project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.4.
Install Angular through [Angular Documentation](https://angular.io/guide/setup-local).

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## License

[MIT](LICENSE) © HackUPC2022
 
