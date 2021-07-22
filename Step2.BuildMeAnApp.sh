export BASE_DOMAIN=$(oc get DNS cluster -o jsonpath=’{.spec.baseDomain}’)
echo ${BASE_DOMAIN}
oc new-app -f BuildConfig.template.yaml \
   -p OPENSHIFT_PROJECT=another-try \
   -p OPENSHIFT_CLUSTER_DOMAIN=$BASE_DOMAIN \
   -p OPENSHIFT_GITHUB_SECRET=i-web-secret

