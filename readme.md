This project is intended to be a minimal test case for an issue that I found with inferno-router.  The issue is that routers don't render correctly if render is called a second time without any user interaction.

This project was developed on a new vagrant machine using the image ubuntu/zesty64.  I've extracted the key provisioning steps and stored them in installSteps.  If the variables at the top of the file are set correctly, you should be able to execute that script as root.  However, it's not long and it might be worth executing each step manually to make sure that there aren't any surprises about what software gets installed.

```
sudo bash ./installSteps
yarn install
```

I use gulp for my builds.  If you type
```
gulp
```
after running all the commands in installSteps and yarn (or npm install), the app should launch in chrome.  To see the behavoir, put a breakpoint in script file on the second render step.  You should see that the first render step behaves as expected and with no errors, but that the second render step throws an error and doesn't update the date.
