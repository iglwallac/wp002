 ### Bunch of commands that maybe useful
 <p>

  - 147  oc secret new-basicauth user-at-bitbucket --username=machineuser --prompt
  - 148  oc secrets link builder user-at-bitbucket
  - 149  oc secret new-basicauth user-at-github


  - 668  oc set build-secret
  - 669  oc set build-secret -h
  - 670  oc set build-secret gwebpuller
  - 671  oc set build-secret secret/gwebpuller
  - 672  oc get secrets
  - 673  oc set build-secret gwebpuller
  - 674  oc set build-secret -h
  - 676  oc set build-secret --push --pull bc/gweb gwebpuller

  - 676  oc set build-secret --push --pull bc/gweb gwebpuller
  - 691  oc create secret generic <secret_name> \\n    --from-literal=username=<user_name> \\n    --from-literal=password=<password> \\n    --type=kubernetes.io/basic-auth
  - 692  oc create secret generic git  \\n    --from-literal=username=<user_name> \\n    --from-literal=password=<password> \\n    --type=kubernetes.io/basic-auth
  - 693  oc create secret generic git  \\n    --from-literal=username=iglwallac \\n    --from-literal=password=Scruffy\@2022 \\n    --type=kubernetes.io/basic-auth
  - 698  oc new-app nodejs~https://github.com/iglwallac/gweb.git --source-secret=git
  - 701  oc new-app nodejs~https://github.com/iglwallac/gweb.git --source-secret=git
  - 703  oc secrets link  git

  - 710  oc describe secrets/builder-token-kk7v7
  - 717  oc create secret generic git  \\n    --from-literal=username=iglwallac \\n    --from-literal=password=Scruffy\@2022 \\n    --type=kubernetes.io/basic-auth
  - 718  oc get secrets
  - 719  oc secrets link builder git
  - 720  oc get secrets


