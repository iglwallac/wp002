FROM nodeshift/centos7-s2i-nodejs:latest
LABEL "io.openshift.s2i.build.commit.author"="gregiw <gwallace@taos.com>" \
      "io.openshift.s2i.build.commit.date"="Wed Jul 21 19:46:51 2021 -0700" \
      "io.openshift.s2i.build.commit.id"="6b3bfd35f8efed0857f3f46ef55b7c9be7920524" \
      "io.openshift.s2i.build.commit.ref"="main" \
      "io.openshift.s2i.build.commit.message"="don't push specials" \
      "io.openshift.s2i.build.source-location"="/Users/gwallace/Desktop/SRC/G/CONVERSION_WIP/i-webplay-LOCAL-dev/i-webplay-WIP-LOCAL/." \
      "io.k8s.display-name"="us.icr.io/adarwin/webplayer" \
      "io.openshift.s2i.build.image"="nodeshift/centos7-s2i-nodejs:latest"

USER root
# Copying in source code
COPY upload/src /tmp/src
# Change file ownership to the assemble user. Builder image must support chown command.
RUN chown -R 1001:0 /tmp/src
USER 1001
# Assemble script sourced from builder image based on user input or image metadata.
# If this file does not exist in the image, the build will fail.
RUN /usr/libexec/s2i/assemble
# Run script sourced from builder image based on user input or image metadata.
# If this file does not exist in the image, the build will fail.
CMD /usr/libexec/s2i/run
