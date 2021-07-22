#!/bin/bash

# Clean previous props files
rm -f *.props

# remove newlines from github commit messages
headCommitMessage=$( jq -r .head_commit.message <<< $payload )
headCommitMessage=$( echo $headCommitMessage | tr -d '\r' )
headCommitMessage=$( echo $headCommitMessage | tr -d '\n' )
headCommitMessage=$( echo $headCommitMessage | tr -d '\"' )

headCommitId=$( jq -r .head_commit.id <<< $payload )
ref=$( jq -r .ref <<< $payload )
deleted=$( jq -r .deleted <<< $payload )
committer=$( jq -r .head_commit.author.name <<< $payload )
echo "ref: $ref"
echo "headCommitId: $headCommitId"
echo "headCommitMessage: $headCommitMessage"
echo "isDeletedBranch: $deleted"
echo "lastCommitter: $committer"

# Check GitHub head commit message to determine what to do next
if [[ $ref =~ ^refs\/tags\/ ]]; then
  echo "This a tag event. Exiting."
elif [[ $deleted =~ ^true ]]; then
  echo "This branch has been deleted. Exiting."
elif [[ -z $headCommitId ]]; then
  echo "The headCommitId is null. Exiting."
elif [[ $headCommitMessage =~ ^chore\(release\):[[:space:]][0-9]+\.[0-9]+\.[0-9]+ ]]; then
  echo "Commit message is a chore. Exiting."
elif [[ $ref =~ ^refs\/heads\/master ]]; then
  echo "Master branch non-chore commit. Running npm-release job..."

  VERSION=`cat package.json | jq -r .version`
  echo "VERSION=$VERSION" > build.props
  echo "headCommitId=$headCommitId" >> build.props
  echo "lastCommitter=$committer" >> build.props
  echo "headCommitMessage=$headCommitMessage" >> build.props
  echo "REPO=$REPO" >> build.props
  echo "BUILD_WORKSPACE=$BUILD_WORKSPACE" >> build.props
  echo "APPLICATION_NAME=$APPLICATION_NAME" >> build.props
  echo "ECR_APPLICATION_NAME=$ECR_APPLICATION_NAME" >> build.props
  echo "NODE_APPLICATION_NAME=$NODE_APPLICATION_NAME" >> build.props
elif [[ $ref =~ ^refs\/heads\/qa ]]; then
  VERSION=`cat package.json | jq -r .version`
  echo "VERSION=$VERSION-${headCommitId}" > build-qa.props

  echo "The GitHub head commit message is a commit on the qa branch. Running QA pipeline ..."
  echo "headCommitId=$headCommitId" >> build-qa.props
  echo "lastCommitter=$committer" >> build-qa.props
  echo "REPO=$REPO" >> build-qa.props
  echo "BUILD_WORKSPACE=$BUILD_WORKSPACE" >> build-qa.props
  echo "APPLICATION_NAME=$APPLICATION_NAME" >> build-qa.props
  echo "ECR_APPLICATION_NAME=$ECR_APPLICATION_NAME" >> build-qa.props
  echo "NODE_APPLICATION_NAME=$NODE_APPLICATION_NAME" >> build-qa.props
else
  echo "Branch commit. Running unit test job..."
  echo "headCommitId=$headCommitId" > unit-test.props
  echo "ref=$ref" >> unit-test.props
  echo "REPO=$REPO" >> unit-test.props
fi


