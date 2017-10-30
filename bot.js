
const DEBUG=true;
const BOTVERSION="Bot v.0.0.3a";

const config = require('./config.json');
const botfn = require('./bot_fn');
const botstr = require('./bot_string');
const db = require("sqlite");
const Discord = require('discord.js');

const client = new Discord.Client();
var ArrLottery = [];
var ArrShowNext = [];

function DEBUGLOG(logstr){
  if(DEBUG)
    console.log(`${new Date().toLocaleString()} ${logstr}`);
}

client.on('ready', () => {
  db.run("CREATE TABLE IF NOT EXISTS gamekeys (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_nickname, discord_channel, NameOfGame, GameKey, getdiscord_id, getdiscord_nickname)");
  db.run("CREATE TABLE IF NOT EXISTS authors (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_channel, discord_nickname)");
  db.run("CREATE TABLE IF NOT EXISTS lottery (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, lotkey_id, lotmessage_id, discord_id, discord_channel, discord_nickname)");
  console.log(`I am ready! ${BOTVERSION}`);
});

client.on('message', message => {
  if(message.author === client.user) return;
  if(DEBUG){
    if(message.channel.type === "text")
      DEBUGLOG(`IN (${message.channel.type})[${message.guild.name}][${message.channel.name}]\$ ${message.author.username}: "${message.content}"`);
    else
      DEBUGLOG(`IN (${message.channel.type})\$ ${message.author.username}: "${message.content}"`);
  }
  if(message.channel.type === "text"){
    if (message.content.startsWith(`${client.user}`)){
      var commandfull = botfn.getCommand(message.content);
      var command = commandfull.match(/^[^\s]+/)[0];
      
      if(command === botstr.err_text_Prefix){
        DEBUGLOG(`OUT ERROR "${commandfull}"`);
        message.reply(commandfull);
      }
      else if (command === "help") {
        DEBUGLOG(`OUT HELP Embed "${commandfull}"`);
        message.author.send(new Discord.RichEmbed(botfn.getHelp(commandfull)).setFooter(BOTVERSION));
      }
      else if (command === "ping") {
        DEBUGLOG(`OUT pong`);
        message.reply("pong");
      }
      else if (command === "addme") {
        db.get(`SELECT id,discord_id,discord_channel FROM authors WHERE discord_id="${message.author.id}"`).then(row => {
          if(!row){
            db.run("INSERT INTO authors (discord_id, discord_channel, discord_nickname) VALUES (?,?,?)",[message.author.id,message.channel.id,message.author.username]);
            DEBUGLOG(`OUT ADDME add to "authors" db [${message.author.id}][${message.author.username}]`);
            message.author.send(botstr.addme_text_AddingSuccess);
            //TODO добавить вывод короткого описания комманд.
          }
          else{
            if(row.discord_channel != message.channel.id){
              db.get(`UPDATE authors SET discord_channel="${message.channel.id}" WHERE discord_id="${message.author.id}"`)
              DEBUGLOG(`OUT ADDME Update "authors" db [${message.author.id}][${message.author.username}]`)
              message.author.send(botstr.addme_text_UpdateSuccess);
            }
            else{
              DEBUGLOG(`OUT ADDME Nothing "authors" db [${message.author.id}][${message.author.username}]`);
              message.author.send(botstr.addme_text_FoundInBase);
            }
          }
        });
        // .catch(() => {
        //   db.run("CREATE TABLE IF NOT EXISTS authors (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_channel, discord_nickname)").then(() => {
        //     db.run("INSERT INTO authors (discord_id, discord_channel, discord_nickname) VALUES (?,?,?)",[message.author.id,message.channel.id,message.author.username]);
        //     message.author.send("Ты добавлен в базу. А я готов принимать ключи.");
        //   });
        // });
      }
      else if (command === "show") {
        db.all(`SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and getdiscord_id IS NULL`).then(row =>{
          if(!row){
            DEBUGLOG(`OUT SHOW Key not Found. (!row)`);
            message.channel.send(botstr.err_text_KeyNotFoundForChannel);
          }
          else{
            for (var j = 0; j < ArrShowNext.length; j++){
              if(ArrShowNext[j].id == message.channel.id){
                ArrShowNext.splice(j,1);
              }
            }
            var strshow ="";
            for (var i =0; i < row.length; i++) {
              if(`${strshow}${botfn.getText(botstr.show_text_FormatNameAuthor,[row[i].id,row[i].NameOfGame,row[i].discord_nickname])}`.length < 1500){
                strshow+=`${botfn.getText(botstr.show_text_FormatNameAuthor,[row[i].id,row[i].NameOfGame,row[i].discord_nickname])}\n`;
              }
              else{
                strshow+=`...`;
                ArrShowNext.push({
                  "id" : message.channel.id,
                  "num" : i
                });
                setTimeout(() =>{
                  for (var j = 0; j < ArrShowNext.length; j++){
                    if(ArrShowNext[j].id == message.channel.id){
                      ArrShowNext.splice(j,1);
                    }
                  }
                },60000);
                break;
              }
            };
            
            if(strshow === ""){
              DEBUGLOG(`OUT SHOW Key Not found.`);
              message.channel.send(botstr.err_text_KeyNotFoundForChannel);
            }
            else{
              DEBUGLOG(`OUT SHOW Key found. [${row.length}]`);
              message.channel.send(botfn.getText(botstr.show_text_KeyFound,strshow));
            }
          }
        });
      }
      else if (command === "showmy") {
        db.all(`SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id IS NULL`).then(row =>{
          if(!row){
            DEBUGLOG(`OUT SHOWMY Key not Found. (!row)`);
            message.channel.send(botstr.err_text_KeyNotFoundForChannel);
          }
          else{
            var strshow ="";
            row.forEach(function(element) {
              if(`${strshow}${botfn.getText(botstr.show_text_FormatNameAuthor,[element.id,element.NameOfGame,element.discord_nickname])}`.length > 2048){
                strshow+=`...`;
                return;
              }
              else{
                strshow+=`${botfn.getText(botstr.show_text_FormatNameAuthor,[element.id,element.NameOfGame,element.discord_nickname])}\n`;
              }
            }, this);
            
            if(strshow === ""){
              DEBUGLOG(`OUT SHOWMY Key not Found.`);
              message.channel.send(botstr.err_text_KeyNotFoundForChannel);
            }
            else{
              DEBUGLOG(`OUT SHOWMY Key Found. [${row.length}]`);
              message.channel.send(botfn.getText(botstr.show_text_KeyFound,strshow));
            }
          }
        });
      }
      else if (command === "getkey") {
        var inId = commandfull.match(/\d+$/)[0];
        if(inId != ""){
          db.get(`SELECT discord_id,NameOfGame,GameKey FROM gamekeys WHERE discord_channel="${message.channel.id}" and id="${inId}" and getdiscord_id IS NULL`).then(row => {
            if(!row){
              DEBUGLOG(`OUT GETKEY not Found. (!row) [${inId}]`);
              message.reply(botfn.getText(botstr.err_text_IndexKeyNotFound,inId));
            }
            else{
              db.run(`UPDATE gamekeys SET getdiscord_id="${message.author.id}",getdiscord_nickname="${message.author.username}" WHERE discord_channel="${message.channel.id}" and id="${inId}"`);
              DEBUGLOG(`OUT GETKEY Key Found. [${inId}] [${message.author.id}][${message.author.username}]`);
              message.channel.send(botfn.getText(botstr.getkey_text_KeyFoundSendChannel,[row.NameOfGame,`${message.author}`]));
              message.author.send(botfn.getText(botstr.getkey_text_KeyFoundSendUser,[row.NameOfGame,row.GameKey,`<@${row.discord_id}>`]));
            }
          });
        }
      }
      else if (command === "start") {
        var inId = commandfull.match(/\b\d+\b/)[0];
        var inTime = commandfull.match(/\d+$/)[0];
        var TimeStr = botfn.getTimeOutStr(inTime);
        
        db.get(`SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="lot"`).then(row =>{
          if(!row){
            DEBUGLOG(`OUT START key not Found for chanel. (!row) [${inId}]`);
            message.channel.send(botstr.err_text_KeyNotFoundForChannel);
          }
          else{
            db.run(`UPDATE gamekeys SET getdiscord_id="runlot" WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="lot"`);
            
            DEBUGLOG(`INSIDE START key Found. start lottery! [${inId}]`);

            var strshow = `${botfn.getText(botstr.show_text_FormatNameAuthor,[row.id,row.NameOfGame,row.discord_nickname])}`;
            var LotteryEmbed = new Discord.RichEmbed(botfn.getStartEmbed([TimeStr,`${botfn.getText(botstr.show_text_KeyFound,strshow)}`])).setColor(botstr.start_color_LotteryStarted);

            message.channel.send("@here",LotteryEmbed).then(messagelot =>{
              
              var lottimer = setTimeout(() => {
                DEBUGLOG(`INSIDE START Ended lottery! [${inId}]`);

                for(var i=0; i < ArrLottery.length; i++){
                  if(ArrLottery[i].id === inId){
                    ArrLottery.splice(i,1);
                    break;
                  }
                }

                db.all(`SELECT discord_id FROM lottery WHERE lotmessage_id="${messagelot.id}"`).then(rows => {
                  if(!rows){
                    db.run(`UPDATE gamekeys SET getdiscord_id="lot" WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="runlot"`);
                    DEBUGLOG(`OUT START Ended lottery! Not checked (not emoji) (!rows) [${inId}]`);
                    messagelot.edit(LotteryEmbed.setColor(botstr.start_color_LotteryStopped));
                    message.channel.send(botfn.getText(botstr.start_text_LotteryStoppedNoReaction,strshow));
                  }
                  else{
                    if(rows.length === 0){
                      DEBUGLOG(`OUT START Ended lottery! Not checked (not emoji) [${inId}]`);
                      db.run(`UPDATE gamekeys SET getdiscord_id="lot" WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="runlot"`);
                      messagelot.edit(LotteryEmbed.setColor(botstr.start_color_LotteryStopped));
                      message.channel.send(botfn.getText(botstr.start_text_LotteryStoppedNoReaction,strshow));
                    }
                    else{
                      var winNum = Math.floor(Math.random()*rows.length);
                      db.get(`SELECT id,discord_id,discord_nickname FROM lottery WHERE lotmessage_id="${messagelot.id}" and discord_id="${rows[winNum].discord_id}"`).then(urow => {
                        if(!urow){
                          db.run(`UPDATE gamekeys SET getdiscord_id="lot" WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="runlot"`);                          
                          DEBUGLOG(`OUT START ERROR Ended lottery! (!urow) [${inId}]`);
                          messagelot.edit(LotteryEmbed.setColor(botstr.start_color_LotteryStopped));
                          message.channel.send(botstr.err_text_LotteryRandom);
                        }
                        else{
                          client.fetchUser(urow.discord_id).then(user => {
                            db.get(`SELECT id,discord_nickname,discord_id,NameOfGame,GameKey FROM gamekeys WHERE discord_channel="${message.channel.id}" and id="${inId}" and getdiscord_id="runlot"`).then(row => {
                              if(!row){
                                DEBUGLOG(`OUT START ERROR Ended lot! Not found lottery id in base (!row) [${inId}]`);
                                messagelot.edit(LotteryEmbed.setColor(botstr.start_color_LotteryStopped));
                                message.reply(botfn.getText(botstr.err_text_LotteryStopped,inId));
                              }
                              else{
                                db.run(`UPDATE gamekeys SET getdiscord_id="${user.id}",getdiscord_nickname="${user.username}" WHERE discord_channel="${message.channel.id}" and id="${inId}"`);
                                if(ArrLottery.length === 0){
                                  db.run(`DELETE FROM lottery`);
                                }
                                else{
                                  db.run(`DELETE FROM lottery WHERE lotmessage_id=${messagelot.id}`);
                                }
                                DEBUGLOG(`OUT START Ended lot! Key sended to (${winNum}/${rows.length})[${user.id}][${user.username}] [${inId}]`);
                                messagelot.edit(LotteryEmbed.setColor(botstr.start_color_LotteryStopped));
                                message.channel.send(botfn.getText(botstr.start_text_LotteryStoppedSuccess,[strshow,`<@${user.id}>`]));
                                user.send(botfn.getText(botstr.getkey_text_KeyFoundSendUser,[row.NameOfGame,row.GameKey,`<@${row.discord_id}>`]));
                              }
                            });
                          });
                        }
                      });
                    }
                  }
                });
              },inTime);

              ArrLottery.push({
                id : inId,
                timer : lottimer,
                msg : messagelot,
                emb : LotteryEmbed
              });

            });
          }
        });
      }
      else if (command === "stop") {
        var inId = commandfull.match(/\d+$/)[0];
        db.get(`SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="runlot"`).then(row => {
          if(!row){
            DEBUGLOG(`OUT STOP Key not Found. (!row)[${inId}]`);
            message.reply(botfn.getText(botstr.err_text_LotteryStopped,inId));
          }
          else{
            var LotMsg;
            var LotEmb;
            if(ArrLottery.length > 0){
              for(var i=0; i < ArrLottery.length; i++){
                if(ArrLottery[i].id === inId){
                  clearTimeout(ArrLottery[i].timer);
                  LotMsg = ArrLottery[i].msg;
                  LotEmb = ArrLottery[i].emb;
                  ArrLottery.splice(i,1);
                  break;
                }
              }
            }
            if(ArrLottery.length === 0){
              db.run(`DELETE FROM lottery`);
            }
            else{
              db.run(`DELETE FROM lottery WHERE lotmessage_id=${LotMsg.id}`);
            }

            DEBUGLOG(`OUT STOP Key Found. Stopped [${inId}]`);
            
            db.run(`UPDATE gamekeys SET getdiscord_id="lot" WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="runlot"`);
            if(LotMsg){
              LotMsg.edit(LotEmb.setColor(botstr.start_color_LotteryStopped));
            }
            strshow = `${botfn.getText(botstr.show_text_FormatNameAuthor,[row.id,row.NameOfGame,row.discord_nickname])}`;
            message.reply(botfn.getText(botstr.stop_text_LotteryStopSuccess,strshow));
          }
        });
      }
      else {
        DEBUGLOG(`OUT ERROR Command not found! "${command}"`);
        message.reply(botfn.getText(botstr.err_text_WrongUseCommandOrUnknownCommand,command));
      }
    }
  }
  else if (message.channel.type === "dm"){
    var commandfull = botfn.getCommand(message.content);
    var command = commandfull.match(/^[^\s]+/)[0];

    if(command === botstr.err_text_Prefix){
        DEBUGLOG(`OUT ERROR "${commandfull}"`);
        message.reply(commandfull);
    }
    else if (command === "help") {
      DEBUGLOG(`OUT HELP embed "${commandfull}"`);
      message.author.send(new Discord.RichEmbed(botfn.getHelp(commandfull)).setFooter(BOTVERSION));
    }
    else if (command === "shorthelp") {
      DEBUGLOG(`OUT SHORTHELP`);
      message.author.send(new Discord.RichEmbed(botfn.getHelp(command)).setFooter(BOTVERSION));
    }
    else if (command === "ping") {
      DEBUGLOG(`OUT pong"`);
      message.author.send("pong");
    }
    else{
      //Команды требующие предварительной авторизации
      db.get(`SELECT discord_id,discord_channel FROM authors WHERE discord_id="${message.author.id}"`).then(arow => {
        if(!arow){
          DEBUGLOG(`OUT You not in base. Send addme`);
          message.reply(botstr.err_text_NotFoundInAuthorBase);
        }
        else if (command === "showlot"){
          db.all(`SELECT id,discord_channel,NameOfGame,GameKey FROM gamekeys WHERE discord_id="${message.author.id}" and getdiscord_id="lot"`).then(row =>{
            if(!row){
              DEBUGLOG(`OUT SHOWLOT Not found lotkey. (!row)`);
              message.reply(botstr.err_text_KeyLotteryNotFound);
            }
            else{
              var strshow ="";
              row.forEach(function(element) {
                showprefix = element.discord_channel != arow.discord_channel ? "*":"";
                strshow+=`${botfn.getText(botstr.show_text_FormatNameKey,[element.id,element.NameOfGame,element.GameKey,`${showprefix}(L)`])}\n`;
              }, this);
              if (strshow === ""){
                DEBUGLOG(`OUT SHOWLOT Not found lotkey.`);
                message.reply(botstr.err_text_KeyLotteryNotFound);
              }
              else{
                DEBUGLOG(`OUT SHOWLOT Found lotkey.`);
                message.reply(botfn.getText(botstr.show_text_KeyFound,strshow));
              }
            }
          });
        }
        else if (command === "showlotrun"){
          db.all(`SELECT id,discord_channel,NameOfGame,GameKey FROM gamekeys WHERE discord_id="${message.author.id}" and getdiscord_id="runlot"`).then(row =>{
            if(!row){
              DEBUGLOG(`OUT SHOWLOTRUN Not found runlotkey. (!row)`);
              message.reply(botstr.err_text_KeyLotteryRunNotFound);
            }
            else{
              var strshow ="";
              row.forEach(function(element) {
                showprefix = element.discord_channel != arow.discord_channel ? "*":"";
                strshow+=`${botfn.getText(botstr.show_text_FormatNameKey,[element.id,element.NameOfGame,element.GameKey,`${showprefix}(R)`])}\n`;
              }, this);
              if (strshow === ""){
                DEBUGLOG(`OUT SHOWLOTRUN Not found runlotkey.`);
                message.reply(botstr.err_text_KeyLotteryRunNotFound);
              }
              else{
                DEBUGLOG(`OUT SHOWLOTRUN Found runlotkey.`);
                message.reply(botfn.getText(botstr.show_text_KeyFound,strshow));
              }
            }
          });
        }
        else if (command === "showkey"){
          db.all(`SELECT id,discord_channel,NameOfGame,GameKey FROM gamekeys WHERE discord_id="${message.author.id}" and getdiscord_id IS NULL`).then(row =>{
            if(!row){
              DEBUGLOG(`OUT SHOWKEY Not found key. (!row)`);
              message.reply(botstr.err_text_KeyNotFound);
            }
            else{
              var strshow ="";
              row.forEach(function(element) {
                showprefix = element.discord_channel != arow.discord_channel ? "*":"";
                strshow+=`${botfn.getText(botstr.show_text_FormatNameKey,[element.id,element.NameOfGame,element.GameKey,`${showprefix}`])}\n`;
              }, this);
              if (strshow === ""){
                DEBUGLOG(`OUT SHOWKEY Not found key.`);
                message.reply(botstr.err_text_KeyNotFound);
              }
              else{
                DEBUGLOG(`OUT SHOWKEY Found key.`);
                message.reply(botfn.getText(botstr.show_text_KeyFound,strshow));
              }
            }
          });
        }
        else if (command === "show"){
          db.all(`SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot" or getdiscord_id="runlot")`).then(row =>{
            if(!row){
              DEBUGLOG(`OUT SHOW Not found all key. (!row)`);
              message.reply(botstr.err_text_KeyNotFound);
            }
            else{
              for (var j = 0; j < ArrShowNext.length; j++){
                if(ArrShowNext[j].id == message.author.id){
                  ArrShowNext.splice(j,1);
                }
              }
              var strshow ="";
              for (var i = 0; i < row.length; i++){
                if(`${strshow}${botfn.getText(botstr.show_text_FormatNameKey,[row[i].id,row[i].NameOfGame,row[i].GameKey])}\n`.length < 1500){
                  showprefix = row[i].discord_channel != arow.discord_channel ? "*":"";
                  if(row[i].getdiscord_id === "lot"){
                    strshow+=`${botfn.getText(botstr.show_text_FormatNameKey,[row[i].id,row[i].NameOfGame,row[i].GameKey,`${showprefix}(L)`])}\n`;
                  }
                  else if (row[i].getdiscord_id === "runlot"){
                    strshow+=`${botfn.getText(botstr.show_text_FormatNameKey,[row[i].id,row[i].NameOfGame,row[i].GameKey,`${showprefix}(R)`])}\n`;
                  }
                  else{
                    strshow+=`${botfn.getText(botstr.show_text_FormatNameKey,[row[i].id,row[i].NameOfGame,row[i].GameKey,`${showprefix}`])}\n`;
                  }
                }
                else{
                  strshow+=`...`;
                  ArrShowNext.push({
                    "id" : message.author.id,
                    "num" : i
                  });
                  setTimeout(() =>{
                    for (var j = 0; j < ArrShowNext.length; j++){
                      if(ArrShowNext[j].id == message.author.id){
                        ArrShowNext.splice(j,1);
                      }
                    }
                  },60000);
                  break;
                }
              }

              if (strshow === ""){
                DEBUGLOG(`OUT SHOW Not found key.`);
                message.reply(botstr.err_text_KeyNotFound);
              }
              else{
                DEBUGLOG(`OUT SHOW Found key.`);
                message.reply(botfn.getText(botstr.show_text_KeyFound,strshow));
              }
            }
          });
        }
        else if (command === "shownext"){
          db.all(`SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot" or getdiscord_id="runlot")`).then(row =>{
            if(!row){
              DEBUGLOG(`OUT SHOWNEXT Not found all key. (!row)`);
              message.reply(botstr.err_text_KeyNotFound);
            }
            else{
              var strshow ="";
              var istart = 0;
              var jArrShowNext = 0;
              if(ArrShowNext.length > 0){
                for (var j = 0; j < ArrShowNext.length; j++){
                  if(ArrShowNext[j].id == message.author.id){
                    jArrShowNext = j;
                    istart = ArrShowNext[j].num;
                    strshow+=`...\n`;
                    break;
                  }
                }
              }
              
              for (var i = istart; i < row.length; i++){
                if(`${strshow}${botfn.getText(botstr.show_text_FormatNameKey,[row[i].id,row[i].NameOfGame,row[i].GameKey])}\n`.length < 1500){
                  showprefix = row[i].discord_channel != arow.discord_channel ? "*":"";
                  if(row[i].getdiscord_id === "lot"){
                    strshow+=`${botfn.getText(botstr.show_text_FormatNameKey,[row[i].id,row[i].NameOfGame,row[i].GameKey,`${showprefix}(L)`])}\n`;
                  }
                  else if (row[i].getdiscord_id === "runlot"){
                    strshow+=`${botfn.getText(botstr.show_text_FormatNameKey,[row[i].id,row[i].NameOfGame,row[i].GameKey,`${showprefix}(R)`])}\n`;
                  }
                  else{
                    strshow+=`${botfn.getText(botstr.show_text_FormatNameKey,[row[i].id,row[i].NameOfGame,row[i].GameKey,`${showprefix}`])}\n`;
                  }
                }
                else{
                  strshow+=`...`;
                  if (istart > 0){
                    ArrShowNext[jArrShowNext].num = i;
                  }
                  break;
                }
              }
              
              
              if (strshow === ""){
                DEBUGLOG(`OUT SHOWNEXT Not found key.`);
                message.reply(botstr.err_text_KeyNotFound);
              }
              else{
                DEBUGLOG(`OUT SHOWNEXT Found key.`);
                message.reply(botfn.getText(botstr.show_text_KeyFound,strshow));
              }
            }
          });
        }
        else if (command === "addkey"){
          var inGameKey = commandfull.match(/[^\s]+$/)[0];
          var inGameName = commandfull.substr(6,commandfull.lastIndexOf(" ")-6).trim();
          
          if((inGameKey != "") && (inGameName != "")){
            db.get(`SELECT id,NameOfGame,GameKey FROM gamekeys WHERE discord_id="${message.author.id}" and NameOfGame="${inGameName}" and GameKey="${inGameKey}" and getdiscord_id IS NULL`).then(row =>{
              if(!row){
                db.run("INSERT INTO gamekeys (discord_id, discord_nickname, discord_channel, NameOfGame, GameKey) VALUES (?,?,?,?,?)",[message.author.id,message.author.username,arow.discord_channel,inGameName,inGameKey]);
                db.get("SELECT id,NameOfGame,GameKey FROM gamekeys WHERE rowid=last_insert_rowid()").then(row => {
                  DEBUGLOG(`OUT ADDKEY added key. ${row.id}. [${row.NameOfGame}][${row.GameKey}]`);
                  //message.reply("```Markdown\n# Добавлено\n"+row.id+". ["+row.NameOfGame+"]["+row.GameKey+"]```");
                  strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey]))}`;
                  message.reply(botfn.getText(botstr.addkey_text_AddKeySuccess,strshow));
                });
              }
              else{
                DEBUGLOG(`OUT ADDKEY ERROR err Added key. Found ${row.id}. [${row.NameOfGame}][${row.GameKey}]`);
                //message.reply("```Markdown\n# Ошибка! Такая запись уже есть\n"+row.id+". ["+row.NameOfGame+"]["+row.GameKey+"]```");
                strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey]))}`;
                message.reply(botfn.getText(botstr.addkey_text_AddKeyFound,strshow));
              }
            });
            // .catch(()=>{
            //   //console.log("[Error Table]");
            //   db.run("CREATE TABLE IF NOT EXISTS gamekeys (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_nickname, discord_channel, NameOfGame, GameKey, getdiscord_id, getdiscord_nickname)").then(()=>{
            //     //console.log("[Tabel Added]");
            //     db.run("INSERT INTO gamekeys (discord_id, discord_nickname, discord_channel, NameOfGame, GameKey) VALUES (?,?,?,?,?)",[message.author.id,message.author.username,arow.discord_channel,inGameName,inGameKey]);
            //     db.get("SELECT id,NameOfGame,GameKey FROM gamekeys WHERE rowid=last_insert_rowid()").then(row => {
            //       //console.log(`[Added] ${row.id} ${row.NameOfGame} ${row.GameKey}`);
            //       message.reply("```Markdown\n# Добавлено\n"+row.id+". ["+row.NameOfGame+"]["+row.GameKey+"]```");
            //     });
            //   });
            // });
          }
        }
        else if (command === "addlot"){
          var inGameKey = commandfull.match(/[^\s]+$/)[0];
          var inGameName = commandfull.substr(6,commandfull.lastIndexOf(" ")-6).trim();

          if((inGameKey != "") && (inGameName != "")){
            db.get(`SELECT id,NameOfGame,GameKey FROM gamekeys WHERE discord_id="${message.author.id}" and NameOfGame="${inGameName}" and GameKey="${inGameKey}" and getdiscord_id="lot"`).then(row =>{
              if(!row){
                db.run("INSERT INTO gamekeys (discord_id, discord_nickname, discord_channel, NameOfGame, GameKey, getdiscord_id) VALUES (?,?,?,?,?,?)",[message.author.id,message.author.username,arow.discord_channel,inGameName,inGameKey,"lot"]);
                db.get("SELECT id,NameOfGame,GameKey FROM gamekeys WHERE rowid=last_insert_rowid()").then(row => {
                  DEBUGLOG(`OUT ADDLOT Added lotkey. ${row.id}. [${row.NameOfGame}][${row.GameKey}]`);
                  strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey,`(L)`]))}`;
                  message.reply(botfn.getText(botstr.addlot_text_AddKeySuccess,strshow));
                });
              }
              else{
                DEBUGLOG(`OUT ADDLOT ERROR err Added lotkey. Found ${row.id}. [${row.NameOfGame}][${row.GameKey}]`);
                strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey,`(L)`]))}`;
                message.reply(botfn.getText(botstr.addlot_text_AddKeyFound,strshow));
              }
            });
          }
        }
        else if (command === "dellot"){
          var inId = commandfull.match(/\d+$/)[0];

          if(inId != ""){
            db.get(`SELECT id,NameOfGame,GameKey FROM gamekeys WHERE discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="lot"`).then(row => {
              if(!row){
                DEBUGLOG(`OUT DELLOT Del lotkey not found. (!row)[${inId}]`);
                message.reply(botfn.getText(botstr.err_text_IndexKeyLotteryNotFound,inId));
              }
              else{
                db.run(`DELETE FROM gamekeys WHERE discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="lot"`);
                DEBUGLOG(`OUT DELLOT Deleted lotkey. [${inId}]`);
                strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey,`(L)`]))}`;
                message.reply(botfn.getText(botstr.dellot_text_DelKeySuccess,strshow));
              }
            });
          }
        }
        else if (command === "delkey"){
          var inId = commandfull.match(/\d+$/)[0];
          if(inId != ""){
            db.get(`SELECT id,NameOfGame,GameKey FROM gamekeys WHERE discord_id="${message.author.id}" and id="${inId}" and getdiscord_id IS NULL`).then(row => {
              if(!row){
                DEBUGLOG(`OUT DELKEY Del key not found. (!row)[${inId}]`);
                message.reply(botfn.getText(botstr.err_text_IndexKeyNotFound,inId));
              }
              else{
                db.run(`DELETE FROM gamekeys WHERE discord_id="${message.author.id}" and id="${inId}" and getdiscord_id IS NULL`);
                DEBUGLOG(`OUT DELKEY Deleted key. [${inId}]`);
                strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey]))}`;
                message.reply(botfn.getText(botstr.delkey_text_DelKeySuccess,strshow));
              }
            });
          }
        }
        else if (command === "del"){
          var inId = commandfull.match(/\d+$/)[0];
          if(inId != ""){
            db.get(`SELECT id,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and id="${inId}" and (getdiscord_id IS NULL or getdiscord_id="lot")`).then(row => {
              if(!row){
                DEBUGLOG(`OUT DEL Del key not found. (!row) [${inId}]`);
                message.reply(botfn.getText(botstr.err_text_IndexKeyNotFound,inId));
              }
              else{
                db.run(`DELETE FROM gamekeys WHERE discord_id="${message.author.id}" and id="${inId}" and (getdiscord_id IS NULL or getdiscord_id="lot")`);
                if(row.getdiscord_id === "lot"){
                  DEBUGLOG(`OUT DEL Deleted key lot. [${inId}]`);
                  strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey,`(L)`]))}`;
                  message.reply(botfn.getText(botstr.dellot_text_DelKeySuccess,strshow));
                }
                else{
                  DEBUGLOG(`OUT DEL Deleted key. [${inId}]`);
                  strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey]))}`;
                  message.reply(botfn.getText(botstr.delkey_text_DelKeySuccess,strshow));
                }
              }
            });
          }
        }
        else if (command === "setkey"){
          var inId = commandfull.match(/\d+$/)[0];
          if(inId != ""){
            db.get(`SELECT id,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and id="${inId}" and (getdiscord_id IS NULL or getdiscord_id="lot")`).then(row => {
              if(!row){
                DEBUGLOG(`OUT SETKEY ERROR id Not Found. (!row) [${inId}]`);
                message.reply(botfn.getText(botstr.err_text_IndexKeyLotteryNotFound,inId));
              }
              else{
                if(row.getdiscord_id === "lot"){
                  db.run(`UPDATE gamekeys SET getdiscord_id=NULL WHERE discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="lot"`);
                  DEBUGLOG(`OUT SETKEY Found. update. [${inId}]`);
                  strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey]))}`;
                  message.reply(botfn.getText(botstr.setkey_text_UpdateKeySuccess,strshow));
                }
                else{
                  DEBUGLOG(`OUT SETKEY Found. not update. [${inId}]`);
                  strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey]))}`;
                  message.reply(botfn.getText(botstr.setkey_text_UpdateKeyFound,strshow));
                }
              }
            });
          }
        }
        else if (command === "setlot"){
          var inId = commandfull.match(/\d+$/)[0];
          if(inId != ""){
            db.get(`SELECT id,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and id="${inId}" and (getdiscord_id IS NULL or getdiscord_id="lot")`).then(row => {
              if(!row){
                DEBUGLOG(`OUT SETLOT ERROR id Not Found. (!row) [${inId}]`);
                message.reply(botfn.getText(botstr.err_text_IndexKeyNotFound,inId));
              }
              else{
                if(row.getdiscord_id === "lot"){
                  DEBUGLOG(`OUT SETLOT Found. Not Update. [${inId}]`);
                  strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey,`(L)`]))}`;
                  message.reply(botfn.getText(botstr.setlot_text_UpdateKeyFound,strshow));
                }
                else{
                  db.run(`UPDATE gamekeys SET getdiscord_id="lot" WHERE discord_id="${message.author.id}" and id="${inId}" and getdiscord_id IS NULL`);
                  DEBUGLOG(`OUT SETLOT Found. Update. [${inId}]`);
                  strshow = `${botfn.getText(botstr.show_text_KeyFound,botfn.getText(botstr.show_text_FormatNameKey,[row.id,row.NameOfGame,row.GameKey,`(L)`]))}`;
                  message.reply(botfn.getText(botstr.setlot_text_UpdateKeySuccess,strshow));
                }
              }
            });
          }
        }
        else if (command === "whereme"){
          var channelfound = false;
          var arrchannels = client.channels.array();
          
          for(var i=0; i < arrchannels.length; i++){
              if(arrchannels[i].id == arow.discord_channel){
                DEBUGLOG(`OUT WHEREME Found: "${arrchannels[i].guild.name}"->"${arrchannels[i].name}"`);
                message.reply(botfn.getText(botstr.whereme_text_FoundSuccess,[arrchannels[i].guild.name,arrchannels[i].name]));
                channelfound = true;
                break;
              }
          }
          if(!channelfound){
            DEBUGLOG(`OUT WHEREME Channel or server Not Found`);
            message.reply(botstr.err_text_AuthorNotFound);
          }
        }
        else{
          DEBUGLOG(`OUT ERROR. Command not found! "${command}"`);
          message.reply(botfn.getText(botstr.err_text_WrongUseCommandOrUnknownCommand,command));
        }
      });
    }
  }
});

client.on('messageReactionAdd', (messageReaction,user) => {
  if(user === client.user) return;
  if(ArrLottery.length > 0){
    for(var i=0; i < ArrLottery.length; i++){
      if(ArrLottery[i].msg.id === messageReaction.message.id){
        db.get(`SELECT id,lotmessage_id,discord_id,discord_channel,discord_nickname FROM lottery WHERE lotmessage_id="${messageReaction.message.id}" and discord_id="${user.id}"`).then(row => {
          if(!row){
            DEBUGLOG(`INSIDE Added reaction. [${ArrLottery[i].id}] ${user.username}`);
            db.run("INSERT INTO lottery (lotkey_id,lotmessage_id,discord_id,discord_channel,discord_nickname) VALUES (?,?,?,?,?)",[ArrLottery[i].id,messageReaction.message.id,user.id,messageReaction.message.channel.id,user.username]);
          }
        });
        break;
      }
    }
  }
});

client.on('messageReactionRemove', (messageReaction,user) => {
  if(user === client.user) return;
  if(ArrLottery.length > 0){
    DEBUGLOG(`INSIDE Deleted reaction. ${user.username}`);
    db.run(`DELETE FROM lottery WHERE lotmessage_id="${messageReaction.message.id}" and discord_id="${user.id}"`);
  }
});


db.open(config.database);
client.login(config.token);

