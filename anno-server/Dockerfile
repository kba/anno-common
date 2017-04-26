FROM kbai/anno

RUN apt-get update && apt-get install -y raptor2-utils

WORKDIR /anno/anno-server
EXPOSE 3000
ENTRYPOINT npm start
