# Technical test @ Doctolib

### Instructions

The code you downloaded is an algorithm which checks the availabilies on an
calendar depending on the events it contains. The main method accepts a start
date and returns the availabilities over the next 7 days. There are two kinds
of events. *Openings* mark times when the user is available and can be
recurring from one week to the next, whereas *appointments* are times when the
user is already booked.

Unfortunately, the code is broken. Here is your mission.

1. Fix the tests.
2. Optimize and refactor if needed.
3. Allow the function to return availabilities on as many days as
   requested (10 for instance).

The function you provide *MUST* use the following signature. It will not pass
our tests otherwise.

```js
async function getAvailabilities(date, numberOfDays = 7) {
  // …
}
```

Please create a commit after each step. Feel free to refactor and add unit
tests at any moment.

### How to turn in

Run the `turnin.sh` (`turnin.ps1` if you are on Windows) script which will
build the `turnin.git.zip` archive you should send us back. **Be aware that any
uncommited change won’t be part of the archive!**

### How to run

* Install [node](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/en/).
* Run `yarn` to install the dependencies.
* Run `yarn test` to run the tests.
* Focus on `src` folder, you are ready!
