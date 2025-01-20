
## **Announcing $5000 grant funding in partnership with [UpRock](https://uprock.com) to build distributed uptime monitoring - check [our web page](https://checkmate.so) for funding ideas** 

![Frame 34](https://github.com/user-attachments/assets/4ecf2d6e-b3f9-47e9-9e31-b9cb8f3f00b9)

![](https://img.shields.io/github/license/bluewave-labs/checkmate)
![](https://img.shields.io/github/repo-size/bluewave-labs/checkmate)
![](https://img.shields.io/github/commit-activity/m/bluewave-labs/checkmate)
![](https://img.shields.io/github/last-commit/bluewave-labs/checkmate)
![](https://img.shields.io/github/languages/top/bluewave-labs/checkmate)
![](https://img.shields.io/github/issues/bluewave-labs/checkmate)
![](https://img.shields.io/github/issues-pr/bluewave-labs/checkmate)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/9901/badge)](https://www.bestpractices.dev/projects/9901)

<h1 align="center"><a href="https://bluewavelabs.ca" target="_blank">Checkmate</a></h1>

<p align="center"><strong>An open source uptime and infrastructure monitoring application</strong></p>

![dashboard](https://github.com/user-attachments/assets/252d6047-522b-4576-8f14-233510e464b8)

Checkmate is an open source monitoring tool used to track the operational status and performance of servers and websites. It regularly checks whether a server/website is accessible and performs optimally, providing real-time alerts and reports on the monitored services' availability, downtime, and response time. 

Checkmate also has an agent, called [Capture](https://github.com/bluewave-labs/capture), to retrieve data from remote servers. While Capture is not required to run Checkmate, it provides additional insigths about your servers' CPU, RAM, disk and temperature status. 

Checkmate has ben stress tested with 1000+ active monitors without any particular issues or performance bottlenecks.

We **love** what we are building here, and we contibuously learn a few things about Reactjs, Nodejs, MongoDB and Docker while building Checkmate. 

## 📦 Demo

See [Checkmate](https://checkmate-demo.bluewavelabs.ca/) in action. The username is uptimedemo@demo.com and the password is Demouser1! (just a note that we update the demo server from time to time, so if it doesn't work for you, please ping us on Discussions channel).

## 🔗 User's guide

Usage instructions can be found [here](https://bluewavelabs.gitbook.io/checkmate). It's still WIP and some of the information there might be outdated. Rest assured, we are doing our best! :)

## 🛠️ Installation

See installation instructions in [Checkmate documentation portal](https://bluewavelabs.gitbook.io/checkmate/quickstart). Alternatively, you can also use [Coolify](https://coolify.io/) for a one click Docker deployment. If you would like to monitor your server infrastructure, you'll need [Capture agent](https://github.com/bluewave-labs/capture). Capture repository also contains the installation instructions. 

## 💚 Questions & ideas

If you have any questions, suggestions or comments, please use our [Discord channel](https://discord.gg/NAb6H3UTjK). We've also launched our [Discussions](https://github.com/bluewave-labs/bluewave-uptime/discussions) page! Feel free to ask questions or share your ideas—we'd love to hear from you!

## 🧩 Features

- Completely open source, deployable on your servers
- Website monitoring
- Page speed monitoring
- Infrastructure monitoring (memory, disk usage, CPU performance etc) - requires [Capture](https://github.com/bluewave-labs/capture)
- Docker monitoring
- Ping monitoring
- SSL monitoring
- Incidents at a glance
- E-mail notifications
- Scheduled maintenance

**Short term roadmap:**

- Port monitoring (**complete**, waiting to be deployed to stable version) https://github.com/bluewave-labs/Checkmate/issues/1476
- Global (distributed) uptime checking on Solana network (**in progress**) 
- Status pages (**in progress**) https://github.com/bluewave-labs/Checkmate/issues/1131 
- Translations (i18n) (**in progress**)
- Better notification options (Webhooks, Discord, Telegram, Slack) https://github.com/bluewave-labs/Checkmate/issues/1545
- Server security monitoring 
- Command line interface (CLI) https://github.com/bluewave-labs/Checkmate/issues/1558
- JSON query monitoring https://github.com/bluewave-labs/Checkmate/issues/1573
- More configuration options
- Tagging/grouping monitors https://github.com/bluewave-labs/Checkmate/issues/1546
- DNS monitoring

## 🏗️ Screenshots
<p>
<img width="2714" alt="server" src="https://github.com/user-attachments/assets/f7cb272a-69a6-48c5-93b0-249ecf20ecc6" />
</p>
<p>
<img width="2714" alt="uptime" src="https://github.com/user-attachments/assets/98ddc6c0-3384-47fd-96ce-7e53e6b688ac" />
</p>
<p>
<img width="2714" alt="page speed" src="https://github.com/user-attachments/assets/b5589f79-da30-4239-9846-1f8bb2637ff9" />
</p>

## 🏗️ Tech stack

- [ReactJs](https://react.dev/)
- [MUI (React framework)](https://mui.com/)
- [Node.js](https://nodejs.org/en)
- [MongoDB](https://mongodb.com)
- [Recharts](https://recharts.org)
- Lots of other open source components!

## A few links 

- If you would like to support us, please consider giving it a ⭐ and click on "watch". 
- Have a question or suggestion for the roadmap/featureset? Check our [Discord channel](https://discord.gg/NAb6H3UTjK) or [Discussions](https://github.com/bluewave-labs/checkmate/discussions) forum.
- Need a ping when there's a new release? Use [Newreleases](https://newreleases.io/), a free service to track releases.
- Watch a Checkmate [installation and usage video](https://www.youtube.com/watch?v=GfFOc0xHIwY)

## 🤝 Contributing

We pride ourselves on building strong connections with contributors at every level. Despite being a young project, Checkmate has already earned 3300 stars and attracted 40+ contributors from around the globe. So, don’t hold back — jump in, contribute and learn with us!

Here's how you can contribute:

0. Star this repo :)
1. Check [Contributor's guideline](https://github.com/bluewave-labs/bluewave-uptime/blob/master/CONTRIBUTING.md). First timers are encouraged to check `good-first-issue` tag.
2. Optionally, read [project structure](https://bluewavelabs.gitbook.io/checkmate/developers-guide/general-project-structure) and [high level overview](https://bluewavelabs.gitbook.io/checkmate/developers-guide/high-level-overview).
3. Have a look at our Figma designs [here](https://www.figma.com/design/RPSfaw66HjzSwzntKcgDUV/Uptime-Genie?node-id=0-1&t=WqOFv9jqNTFGItpL-1) if you are going to use one of our designs. We encourage you to copy to your own Figma page, then work on it as it is read-only.
4. Open an issue if you believe you've encountered a bug.
5. Check for good-first-issue's if you are a newcomer.
6. Make a pull request to add new features/make quality-of-life improvements/fix bugs.

<a href="https://github.com/bluewave-labs/checkmate/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=bluewave-labs/checkmate" />
</a>

<!--

![Alt](https://repobeats.axiom.co/api/embed/c35d999c82dbb31e967427ea4166c14da4172e73.svg "Repobeats analytics image")

--> 

[![Star History Chart](https://api.star-history.com/svg?repos=bluewave-labs/checkmate&type=Date)](https://star-history.com/#bluewave-labs/bluewave-uptime&Date)

Also check other developer and contributor-friendly projects of BlueWave:

- [DataRoom](https://github.com/bluewave-labs/bluewave-dataroom), an secure file sharing application, aka dataroom.
- [BlueWave HRM](https://github.com/bluewave-labs/bluewave-hrm), a complete Human Resource Management platform.
- [Guidefox](https://github.com/bluewave-labs/guidefox), an application that helps new users learn how to use your product via hints, tours, popups and banners.
- [VerifyWise](https://github.com/bluewave-labs/verifywise), the first open source AI governance platform.

![image](https://badges.pufler.dev/visits/bluewave-labs/checkmate) since 14 Jan, 2025
