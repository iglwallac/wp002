# oc create secret generic <GIVE_IT_THE_NAME_YOU_WANT> \
   # --from-literal=username=<YOUR_GITHUB_USERNAME> \
   # --from-literal=password=<YOUR_GITHUB_PERSONAL_ACCESS_TOKEN> \
   # --type=kubernetes.io/basic-auth


oc create secret generic i-web-secret \
   --from-literal=username=iglwallac \
   --from-literal=password=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 \
   --type=kubernetes.io/basic-auth

export BASE_DOMAIN=$(oc get DNS cluster -o jsonpath=’{.spec.baseDomain}’)


echo ${BASE_DOMAIN}
