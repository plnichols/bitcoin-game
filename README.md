# Bitcoin Game
The app was built using Backbone.js and as a client-side application, all data (rate, bet, result, balance, etc...) is stored in the browser's local storage.

The idea behind the application architecture was to use a component-based approach. This helps focus on single functionality and develop smaller components, easier to maintain, test and scale.

I tried to split the JS code into these small units/components that act as much as possible as standalone components. The HTML markup and Sass/CSS styles was developed in a similar way using the BEM methodology (block, element, modifier).  This has proved to help a lot with maintainability, code quality and developer ramp up time.

This being my first experience with Backbone, I'm sure some parts of the JS application might benefit from different design pattern or architecture that may (or may not) be more specific to Backbone.  But at the end of the day, it was a great opportunity to implement something different, a little bit outside my comfort zone of AngularJS!



# Run project
- Download `app` folder from Git or download zip file or,
- Extract/unzip `bitcoin-game-pierre-luc-nichols.zip` on your computer.
- Open `app/index.html` in your browser.



# Tech notes
All development files (gulp, bower, package.json, etc...) are included within the zip file. These are not necessary to run the project, but are there just as a reference.