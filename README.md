<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
***
***
***
*** To avoid retyping too much info. Do a search and replace for the following:
*** alexwoodsy, SHED-ONLINE, @alexwoodsy, alexanderwilliamwoods@gmail.com, SHED-online, project_description
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="http://shed-online.com">
    <img src="https://github.com/alexwoodsy/SHED-ONLINE/blob/main/src/images/Logo.png" alt="Logo" width="696.5" height="314.5">
  </a>

  <h3 align="center"><a href="http://shed-online.com"> SHED - Online</a></h3>

  <p align="center">
    Online Card game build on top of the turn based JavaScript boardgam.io engine, with a React front end
    <!-- <br />
    <a href="https://github.com/alexwoodsy/SHED-ONLINE"><strong>Explore the docs »</strong></a> -->
    <br />
    <br />
    <a href="http://shed-online.com">Play with friends here!</a>
    ·
    <a href="https://github.com/alexwoodsy/SHED-ONLINE/issues">Report Bug</a>
    ·
    <a href="https://github.com/alexwoodsy/SHED-ONLINE/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
This is a project I have been working on in my spare time during lockdown. Besides being great fun and good project to 
familiaise myself further with JavaScript, React and web/game developent. I started this project so me and my friends could play our favourite card game we used to play whilst at university (before lockdown hit).

A few months later and here we are :smile:. The game is free to play at [SHED-Online](http://shed-online.com), hosted by Heroku.


### Built With

* [boardgame.io](https://github.com/boardgameio/boardgame.io)
* [React](https://github.com/facebook/react/)
* [Konva](https://github.com/konvajs/konva) (HTML5 Canvas JavaScript framework)



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

Make sure you have node installed, everything can then be installed using node package manager (see below)


### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/alexwoodsy/SHED-ONLINE.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
### Running Locally
to run the game locally do the following

1. start two clients (or up to four for the max number of players) 
```sh
npm start
```
2. initialise the server which initialises the server
```sh
npm run serve
```

optionally you can just open a single client in debug mode to see the game interface. to do this, within `config.js`
set 
```javascript
export const DEBUGING_UI = true 
```





<!-- USAGE EXAMPLES -->
<!-- ## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_
 -->


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/alexwoodsy/SHED-ONLINE/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Feel free to fork this and play around with it, any pull requests are welcome :smile:. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Your Name - [@alexwoodsy](https://twitter.com/@alexwoodsy) - alexanderwilliamwoods@gmail.com

Project Link: [https://github.com/alexwoodsy/SHED-ONLINE](https://github.com/alexwoodsy/SHED-ONLINE)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* Big thanks to Harry Collins for drawing the lovely grpahics







<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/alexwoodsy/SHED-online.svg?style=for-the-badge
[contributors-url]: https://github.com/alexwoodsy/SHED-online/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/alexwoodsy/SHED-online.svg?style=for-the-badge
[forks-url]: https://github.com/alexwoodsy/SHED-online/network/members
[stars-shield]: https://img.shields.io/github/stars/alexwoodsy/SHED-online.svg?style=for-the-badge
[stars-url]: https://github.com/alexwoodsy/SHED-online/stargazers
[issues-shield]: https://img.shields.io/github/issues/alexwoodsy/SHED-online.svg?style=for-the-badge
[issues-url]: https://github.com/alexwoodsy/SHED-online/issues
[license-shield]: https://img.shields.io/github/license/alexwoodsy/SHED-online.svg?style=for-the-badge
[license-url]: https://github.com/alexwoodsy/SHED-online/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/alex-woods-913a811a6
