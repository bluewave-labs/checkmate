---
icon: diagram-project
---

# General project structure

The Uptime Manager product uses the MERN stack, which is to say that the project uses:

* React on the Front End via Vite
* Express on the Back End via NodeJS
* MongoDB for data with Mongoose for data access

### Front end

The project uses the [Material UI Components](https://mui.com/material-ui/all-components/) (MUI) which allows us to build with a minimum of fuss.  The library is highly customisable and the project makes heavy use of the Theme concept and follows MUI’s paradigm to avoid writing excessive CSS.\
\
The overriding goal on the Front Eed is to write maintainable and scalable code.  If you find yourself writing lots of CSS to customize a component or are having to set a value often like font size or color you probably should be using the theme.\
\
When making changes to the Front end please always keep future developers in mind.  Will they know how to make changes to your code?  Is your code modular?  If a dev makes changes elsewhere in the app will your component be affected?  If the team makes a theme change like font size or primary color will your component be updated as well?&#x20;

### Back end

The back end of this project is not especially complex and is built around Express.  The back end is a RESTful API and the [documentation can be found here](https://checkmate-demo.bluewavelabs.ca/api-docs).

The application consists of several main conceptual models:

1. User
2. Monitor
3. Check
4. Notification

There are several supporting models as well.

1. AppSettings
2. InviteToken
3. Team

All requests are based around these models and manipulation of their data.\
\
In general the models interact in this fashion:

* A `User` has many `Monitors`
* A `Monitor` has many `Checks`
* A `Monitor` has many `Notifications`

A `User` can create a `Monitor`.  `Monitors` are enqueued in the `JobQueue`, and their target URLs are queried when they are dequeued.  When the query is complete, a `Check` is created that records information about the request.\
\
A `User` may attach a `Notification` to their `Monitor`, if the `Monitor`’s status changes then the user will be notified by the method specified in the `Notification`
