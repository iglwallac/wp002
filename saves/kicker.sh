 oc new-project $1
oc new-app --image-stream="openshift/nodejs:14-ubi8" https://github.com/aglwallac/webplay.git

echo " WATCH FOR: 
### --> Success
    ### Build scheduled, use 'oc logs -f buildconfig/webplay' to track its progress.
    ### Application is not exposed. You can expose services to the outside world by executing one or more of the commands below:
     ### 'oc expose service/webplay'
    ### Run 'oc status' to view your app.
"

