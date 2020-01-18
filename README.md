# Seth Family Website

This repository contains code for the Seth family web site. 

# Setup

## Node and NPM Setup

On Windows or mac, please install nodejs from the official [Node Js Downloads](https://nodejs.org/en/download/).

In 'Command Prompt' (Windows) or 'Terminal' (mac), the following commands should run : 

```shell
node -v
npm -v
```

## Setup repository

Download this repository. 

For downloading as a zip file, click on the "Clone or Download" button on this page, and select "Download ZIP". Then unzip the zip file in a folder of your choice. We suggest :

* $HOME/work/sethfamily for Mac
* C:/work/sethfamily for Windows

Instructions for mac :

Download the zip file from github. You should have a file called sethfamily-master.zip in Downloads folder.

```shell
cd ~
mkdir work (if it does not exist)
cd work
unzip ~/Downloads/sethfamily-master.zip
```

You should now have a folder called sethfamily-master

```shell
mv sethfamily-master sethfamily
rm ~/Downloads/sethfamily-master.zip
```

Advanced users can checkout the repository using git clone.

```shell
cd work
git clone git@github.com:skseth/sethfamily.git
```

## Initialize npm modules

In "Command Prompt" or "Terminal" go to the sethfamily folder and run the followinng commands :

On Windows :

```shell
cd C:\work\sethfamily
npm update
```

On Mac :

```shell
cd ~/work/sethfamily
npm update
```

You can run this command any number of times.

## Copy secrets.json

You will be provided a secrets.json file separately - this needs to be copied into the sethfamily folder. It provides credentials for accessing google sheets and drives.

# Running the Web Site

In Command Prompt, or Terminal, run the following command :

```shell
cd <TO THE INSTALL FOLDER>
npm start
```

In your browser, visit the site : https://localhost:3000/




