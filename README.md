# Online Drawing Tool
Web-based generic drawing tool with collaboration features.

## Collaboration
- You can join rooms.
- You can create your own rooms which each has its own canvas.
- You set your alias and other people in a room can see your cursor live.

## Drawing features
- Choose different colors.
- Choose different sized pens.
- Pan and zoom.
- Undo.

## How it works?
socket.io and a html canvas.

## How to setup a clone?
- Rent a server with docker installed.
- Spin up the docker container using the run-script: `$ chmod +x run.sh && run.sh`.
- Access the tool at port: `8888`.

## Todo
- remove eventhandlers in client
- optimize speed
- erase
