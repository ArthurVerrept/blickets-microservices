## <b>Getting Started</b>
### <b>Global installs:</b>
We generate protos using a global install of protobuf, so go get it!
```
brew install protobuf
```

### <b>Run Databases:</b>
To start the databases simply run:
```
docker-compose up -d
```

### <b>Install dependacies:</b>
Once you have installed the global packages required, install the all the dependacies by pressing:
```
 cmd + shift + p
```
- Select the <b>Tasks: Run Task</b> option <br>
- Then choose the: <b>Install Dependacies</b> task

### <b>Run the project 🏃:</b>
Once you have installed the dependacies using the task, we can start the project by once again pressing:
```
 cmd + shift + p
```
- Select the <b>Tasks: Run Task</b> option <br>
- Then choose the: <b>Start Dev</b> task

✨ If everything is setup correctly, you should be up and running ✨

## Commmands:
To generate the protos make sure you are in the proto folder and run:
```
npm run gen
```
This command locally generates the typescript for each service, and the gateway, replacing the folder locally.

## To-do's:

<b>Big improvements 🪄 </b>
- [x] Make onboarding better eg. Dockerify dev enviroment
- [ ] Rewrite one or more services in golang
- [ ] Distributed transactions with temporal
- [ ] Git actions proto stuff
- [ ] Somehow make each service deploy seperately through git
- [ ] Make frontend not god awful
- [ ] Generate frontend client
- [ ] Investigate better gateway
- [ ] Make calls unary
- [ ] Use migrations
- [ ] Move front-end into here for one giant monorepo

<b>Small improvements 🌴 </b>
- [ ] Make imports from proto-npm package service different per service i.e:    import foo from ‘photo-npm/fooService’
- [ ] Better logging
- [x] make files uploaded decentralised with IPFS
- [ ] For safety, we would need a cron job to check the currently deployed contracts(events) so see if they are all in the dn since when the event is created there is a chance that the request to save that event in our db failed
- [ ] Make url search params part of metadata, good stackoverflow explanation about how params in axios have to be appended in url path https://stackoverflow.com/questions/46404051/send-object-with-axios-get-request
- [ ] Make transaction status call return something to indicate whether to reload the events which will save a lot of api reqs
- [ ] Store userId in token key local storage or else you’ll be usingg someone else account 
- [ ] Add description in mongoldb for the event
- [ ] Check if wallet address selected is the one that setup the events, if not show an alert banner
- [ ] Create function to show all info in eventDisplayDetails from contract to slow down api calls
- [ ] Fix sort on events
- [ ] Add a link to list your token listed listed
- [ ] Add contract level metadata https://docs.opensea.io/docs/contract-level-metadata
- [ ] Add way to remove address form users account in settings
- [ ] Add those returned addresses to local storage to to adhere to login flow and check if addresses exist before trying to add
- [ ] Check status not working sometimes
- [ ] Ticket has 0 value twice
- [ ] Time need to be set
- [ ] blockchainEventInfo currently does 4 requests to contract, make function on contract to return everything
- [ ] Fix grace errors between each other by looking at this https://docs.nestjs.com/microservices/exception-filters#exception-filters
- [ ] FAIRLY IMPORTANT, make request to get userId from email locked to outside somehow
