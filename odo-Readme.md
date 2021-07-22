gwallace@mac-gwallace:~/Desktop/SRC/G/CONVERSION_WIP/i-webplay|main⚡ ⇒  odo
odo is a CLI tool for running OpenShift applications in a fast and automated manner.
Reducing the complexity of deployment, odo adds iterative development without the worry of deploying your source code.

Find more information at https://github.com/openshift/odo

Get started by creating a new application:

 git clone https://github.com/openshift/nodejs-ex && cd nodejs-ex
 odo create nodejs
 odo push

Your nodejs application has now been deployed. odo has pushed the source code, built the application and deployed it on OpenShift.
You can now edit your code in real time and watch as odo automatically deploys your application.

 odo watch

To access your application, create a URL:

 odo url create myurl
 odo push

More information such as logs or what components you've deployed can be accessed with these commands:

 odo describe
 odo list
 odo log

To see a full list of commands, run 'odo --help'