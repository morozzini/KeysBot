
const DEBUG = true;
const BOTVERSION = "Keys Bot v.0.0.5b";

const config = require('./config.json');
const botstr = require(`./${config.lang}`);
const botfn = require('./bot_fn');
botfn.botstr = botstr;
const db = require("sqlite");
const Discord = require('discord.js');

const client = new Discord.Client();
var ArrLottery = [];
var ShowNextMap = new Map();

function DEBUGLOG(logstr) {
    if (DEBUG)
        console.log(`${new Date().toISOString().replace(/T/, ` `).replace(/\..+/, '')} ${logstr}`);
}

client.on('ready', () => {
    db.run("CREATE TABLE IF NOT EXISTS gamekeys (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_nickname, discord_channel, NameOfGame, GameKey, getdiscord_id, getdiscord_nickname)");
    db.run("CREATE TABLE IF NOT EXISTS authors (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_channel, discord_nickname)");
    db.run("CREATE TABLE IF NOT EXISTS lottery (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, lotkey_id, lotmessage_id, discord_id, discord_channel, discord_nickname)");
    console.log(`${new Date().toLocaleString()} I am ready! ${BOTVERSION}`);

    for (let [key, value] of client.guilds) {
        console.log(`${value.name}`);
        chnls = value.channels;
        for (let [key, value] of chnls) {
            console.log(` |-(${value.type})${value.name}`);
        }
    }
    db.all(`SELECT id,discord_id,discord_channel FROM gamekeys WHERE getdiscord_id="lotrun"`).then(lotrow => {
        if (lotrow) {
            if (lotrow.length > 0) {
                DEBUGLOG(`INSIDE After start Found Run Lottery ${lotrow.length}`)
                db.run(`UPDATE gamekeys SET getdiscord_id="lot",getdiscord_nickname=NULL WHERE getdiscord_id="lotrun"`);
                let users = [];

                for (let i = 0; i < lotrow.length; i++) {
                    if (users.length == 0) {
                        users.push({
                            userid: lotrow[i].discord_id,
                            lotid: `${lotrow[i].id}`
                        });
                    }
                    else {
                        let found = false;
                        for (let j = 0; j < users.length; j++) {
                            if (users[j].userid == lotrow[i].discord_id) {
                                users[j].lotid += `,${lotrow[i].id}`;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            users.push({
                                userid: lotrow[i].discord_id,
                                lotid: `${lotrow[i].id}`
                            });
                        }
                    }
                }

                users.forEach(element => {
                    client.fetchUser(element.userid).then(user => {
                        DEBUGLOG(`OUT AFTERSTART Found lottery "${user.username}" [${element.lotid}]`)
                        user.send(botfn.getText(botstr.err_text_FoundLotteryRunAfterStart, element.lotid));
                    });
                });
            }
        }
    });
});

client.on('message', message => {
    if (message.author === client.user) return;

    if (message.channel.type === "text") {
        if (message.content.startsWith(`${client.user}`)) {
            DEBUGLOG(`IN (${message.channel.type})[${message.guild.name}][${message.channel.name}]\$ ${message.author.username}: "${message.content}"`);
            var command = botfn.getCommand(message.content);

            if (command.err) {
                DEBUGLOG(`OUT ERROR "${command.prm}"`);
                message.reply(command.prm);
            }
            else if (command.cmd === "help") {
                DEBUGLOG(`OUT HELP Embed "${command.scmd}"`);
                message.author.send(new Discord.RichEmbed(botfn.getHelp(command)).setFooter(BOTVERSION));
            }
            else if (command.cmd === "ping") {
                DEBUGLOG(`OUT pong`);
                message.reply("pong");
            }
            else if (command.cmd === "about") {
                DEBUGLOG(`OUT ABOUT embed "${command.cmd}"`);
                message.author.send(new Discord.RichEmbed(botfn.getAboutEmbed(client.user.avatarURL)).setFooter(BOTVERSION));
            }
            else if (command.cmd === "addme") {
                db.get(`SELECT id,discord_id,discord_channel FROM authors WHERE discord_id="${message.author.id}"`).then(row => {
                    if (!row) {
                        db.run("INSERT INTO authors (discord_id, discord_channel, discord_nickname) VALUES (?,?,?)", [message.author.id, message.channel.id, message.author.username]);
                        DEBUGLOG(`OUT ADDME add to "authors" db [${message.author.id}][${message.author.username}]`);
                        message.author.send(botstr.addme_text_AddingSuccess);
                        //TODO добавить вывод короткого описания команд.
                    }
                    else {
                        if (row.discord_channel != message.channel.id) {
                            db.get(`UPDATE authors SET discord_channel="${message.channel.id}" WHERE discord_id="${message.author.id}"`)
                            DEBUGLOG(`OUT ADDME Update "authors" db [${message.author.id}][${message.author.username}]`)
                            message.author.send(botstr.addme_text_UpdateSuccess);
                        }
                        else {
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
            else if (command.cmd === "show") {
                var request = "";
                var inSubCommand = command.scmd;

                var jarr = 0;
                var istart = 0;

                if (inSubCommand === "next" && ShowNextMap.has(message.channel.id)) {
                    istart = ShowNextMap.get(message.channel.id).num;
                    request = ShowNextMap.get(message.channel.id).req;
                }
                else if (inSubCommand === "my") {
                    request = `SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id IS NULL`;
                }
                else if ((inSubCommand === "lot") || (inSubCommand === "lotrun")) {
                    request = `SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and getdiscord_id="lotrun"`;
                }
                else {
                    request = `SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and getdiscord_id IS NULL`;
                }

                if (istart == 0) {
                    if (ShowNextMap.has(message.channel.id)) {
                        ShowNextMap.get(message.channel.id).num = 0;
                        ShowNextMap.get(message.channel.id).req = request;
                    }
                }

                db.all(request).then(row => {
                    if (!row) {
                        DEBUGLOG(`OUT SHOW Not found all key. (!row)`);
                        message.reply(botstr.err_text_KeyNotFound);
                    }
                    else {
                        var strshow = istart > 0 ? "...\n" : "";

                        for (var i = istart; i < row.length; i++) {
                            if (`${strshow}${botfn.getText(botstr.show_text_FormatNameAuthor, [row[i].id, row[i].NameOfGame, row[i].discord_nickname])}\n`.length < 1500) {
                                strshow += `${botfn.getText(botstr.show_text_FormatNameAuthor, [row[i].id, row[i].NameOfGame, row[i].discord_nickname])}\n`;
                            }
                            else {
                                if (ShowNextMap.has(message.channel.id)) {
                                    ShowNextMap.get(message.channel.id).num = i;
                                    ShowNextMap.get(message.channel.id).req = request;
                                }
                                else {
                                    ShowNextMap.set(message.channel.id, {
                                        num: i,
                                        req: request
                                    });
                                }
                                strshow += `...`;
                                break;
                            }
                        }

                        if (strshow === "") {
                            DEBUGLOG(`OUT SHOW Not found key.`);
                            message.channel.send(botstr.err_text_KeyNotFoundForChannel);
                        }
                        else {
                            DEBUGLOG(`OUT SHOW Found key.`);
                            message.channel.send(botfn.getText(botstr.show_text_KeyFound, strshow));
                        }
                    }
                });
            }
            else if (command.cmd === "getkey") {
                var inId = command.id;
                if (inId != "") {
                    db.get(`SELECT discord_id,NameOfGame,GameKey FROM gamekeys WHERE discord_channel="${message.channel.id}" and id="${inId}" and getdiscord_id IS NULL`).then(row => {
                        if (!row) {
                            DEBUGLOG(`OUT GETKEY not Found. (!row) [${inId}]`);
                            message.reply(botfn.getText(botstr.err_text_IndexKeyNotFound, inId));
                        }
                        else {
                            db.run(`UPDATE gamekeys SET getdiscord_id="${message.author.id}",getdiscord_nickname="${message.author.username}" WHERE discord_channel="${message.channel.id}" and id="${inId}"`);
                            DEBUGLOG(`OUT GETKEY Key Found. [${inId}] [${message.author.id}][${message.author.username}]`);
                            message.channel.send(botfn.getText(botstr.getkey_text_KeyFoundSendChannel, [row.NameOfGame, `${message.author}`]));
                            strshow = botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [inId, row.NameOfGame, row.GameKey]));
                            message.author.send(botfn.getText(botstr.getkey_text_KeyFoundSendUser, [strshow, `<@${row.discord_id}>`]));
                        }
                    });
                }
            }
            else if (command.cmd === "start") {
                let inId = command.id;
                let reqId = botfn.getIdRequest(command.id);
                let minId;
                let allId = ``;
                let inTime = command.time;
                let TimeStr = botfn.getTimeOutStr(inTime);

                let limit = 20;

                db.all(`SELECT id,discord_nickname,discord_id,NameOfGame,GameKey FROM gamekeys WHERE (${reqId}) and discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lot"`).then(row => {
                    if (!row || row.length == 0) {
                        DEBUGLOG(`OUT START key not Found for chanel. (!row) [${inId}]`);
                        message.channel.send(botstr.err_text_KeyNotFoundForChannel);
                    }
                    else if (row.length > limit){
                        DEBUGLOG(`OUT START key Found for chanel. but over limit(${row.length}>${limit}) [${inId}]`);
                        message.channel.send(botfn.getText(botstr.err_text_LotteryOverLimitKeys,[row.length, limit]));
                    }
                    else {
                        DEBUGLOG(`INSIDE START key Found. start lottery! [${inId}]`);
                        let strshow = ``;
                        minId = row[0].id;
                        for (let i = 0; i < row.length; i++) {
                            strshow += `${botfn.getText(botstr.show_text_FormatNameAuthor, [row[i].id, row[i].NameOfGame, row[i].discord_nickname])}\n`;
                            allId += (allId == ``) ? `${row[i].id}` : `,${row[i].id}`;
                            if (minId > row[i].id)
                                minId = row[i].id;
                        }
                        var LotteryEmbed = new Discord.RichEmbed(botfn.getStartEmbed([TimeStr, `${botfn.getText(botstr.show_text_KeyFound, strshow)}`])).setColor(botstr.start_color_LotteryStarted);

                        message.channel.send("@here", LotteryEmbed).then(messagelot => {
                            db.run(`UPDATE gamekeys SET getdiscord_id="lotrun",getdiscord_nickname=${messagelot.id} WHERE (${reqId}) and discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lot"`);
                            var lottimer = setTimeout(() => {
                                DEBUGLOG(`INSIDE START Ended lottery! [${inId}]`);

                                for (var i = 0; i < ArrLottery.length; i++) {
                                    if (ArrLottery[i].id == minId) {
                                        ArrLottery.splice(i, 1);
                                        break;
                                    }
                                }

                                db.all(`SELECT id,discord_id,discord_nickname FROM lottery WHERE lotmessage_id="${messagelot.id}"`).then(lot_players_rows => {
                                    if (!lot_players_rows || lot_players_rows.length === 0) {
                                        db.run(`UPDATE gamekeys SET getdiscord_id="lot",getdiscord_nickname=NULL WHERE (${reqId}) and discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun"`);
                                        DEBUGLOG(`OUT START Ended lottery! Not checked (not emoji) (!lot_players_rows || lot_players_rows.length === 0) [${allId}]`);
                                        messagelot.edit(LotteryEmbed.setColor(botstr.start_color_LotteryStopped));
                                        message.channel.send(botfn.getText(botstr.start_text_LotteryStoppedNoReaction, allId));
                                    }
                                    else {
                                        var winNum = Math.floor(Math.random() * lot_players_rows.length);

                                        client.fetchUser(lot_players_rows[winNum].discord_id).then(user => {
                                            strshow = ``;
                                            for (let i = 0; i < row.length; i++) {
                                                strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey])}\n`;
                                            }
                                            DEBUGLOG(`OUT START Ended lot! Key sended to (${winNum}/${lot_players_rows.length})[${user.id}][${user.username}] [${minId}]`);

                                            db.run(`UPDATE gamekeys SET getdiscord_id="${user.id}",getdiscord_nickname="${user.username}" WHERE (${reqId}) and discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun"`);
                                            messagelot.edit(LotteryEmbed.setColor(botstr.start_color_LotteryStopped));
                                            message.channel.send(botfn.getText(`${botstr.start_text_LotteryStoppedSuccess} ${botstr.getkey_text_KeyFoundSendChannel}`, [allId, `<@${user.id}>`]));
                                            user.send(botfn.getText(botstr.getkey_text_KeyFoundSendUser, [botfn.getText(botstr.show_text_KeyFound, strshow), `<@${row[0].discord_id}>`]));
                                        });
                                    }

                                    if (ArrLottery.length === 0) {
                                        db.run(`DELETE FROM lottery`);
                                    }
                                    else {
                                        db.run(`DELETE FROM lottery WHERE lotmessage_id=${messagelot.id}`);
                                    }
                                });
                            }, inTime);

                            ArrLottery.push({
                                author: message.author.id,
                                id: `${minId}`,
                                timer: lottimer,
                                msg: messagelot,
                                emb: LotteryEmbed
                            });
                        });
                    }
                });
            }
            else if (command.cmd === "stop") {
                let request = "";
                let inId;
                let reqId;

                if (`id` in command) {
                    inId = command.id;
                    reqId = botfn.getIdRequest(command.id);
                    request = `
                        SELECT id,discord_nickname,discord_id,NameOfGame
                        FROM gamekeys WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun" and
                            getdiscord_nickname IN (SELECT getdiscord_nickname 
                                                    FROM gamekeys
                                                    WHERE (${reqId}) and discord_id="${message.author.id}" and getdiscord_id="lotrun")`;
                }
                else {
                    inId = `all`;
                    request = `SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun"`;
                }

                db.all(request).then(row => {
                    if (!row) {
                        DEBUGLOG(`OUT STOP Key not Found. (!row)[${inId}]`);
                        message.reply(botfn.getTextErr(botstr.err_text_KeyLotteryRunNotFound));
                    }
                    else {
                        if (row.length > 0) {
                            if (row.length == 1 && inId === `all`) {
                                inId = `${row[0].id}`;
                            }
                            let LotMsgId = ``;
                            if (ArrLottery.length > 0) {
                                for (let j = 0; j < row.length; j++) {
                                    for (let i = ArrLottery.length - 1; i >= 0; i--) {
                                        if ((ArrLottery[i].id == row[j].id) || (inId === `all` && ArrLottery[i].author === message.author.id)) {

                                            clearTimeout(ArrLottery[i].timer);
                                            ArrLottery[i].msg.edit(ArrLottery[i].emb.setColor(botstr.start_color_LotteryStopped));
                                            if (LotMsgId === ``) {
                                                LotMsgId = `${ArrLottery[i].msg.id}`;
                                            }
                                            else {
                                                LotMsgId += `,${ArrLottery[i].msg.id}`;
                                            }

                                            ArrLottery.splice(i, 1);
                                            //break;
                                        }
                                    }
                                }
                            }

                            if (ArrLottery.length === 0) {
                                db.run(`DELETE FROM lottery`);
                            }
                            else if (LotMsgId != ``) {
                                db.run(`DELETE FROM lottery WHERE lotmessage_id IN (${LotMsgId})`);
                            }

                            DEBUGLOG(`OUT STOP Key Found. Stopped [${inId}]`);
                            if (inId === `all`) {
                                db.run(`UPDATE gamekeys SET getdiscord_id="lot",getdiscord_nickname=NULL WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun"`);
                                //strshow = `${botfn.getText(botstr.show_text_FormatNameAuthor, [row.id, row.NameOfGame, row.discord_nickname])}`;
                                message.reply(botfn.getText(botstr.stop_text_ManyLotteryStopSuccess));
                            }
                            else if (row.length > 1) {
                                db.run(`UPDATE gamekeys
                                        SET getdiscord_id="lot",getdiscord_nickname=NULL
                                        WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun" and
                                                getdiscord_nickname IN (
                                                    SELECT getdiscord_nickname 
                                                    FROM gamekeys
                                                    WHERE (${reqId}) and discord_id="${message.author.id}" and getdiscord_id="lotrun")`);
                                //strshow = `${botfn.getText(botstr.show_text_FormatNameAuthor, [row.id, row.NameOfGame, row.discord_nickname])}`;
                                message.reply(botfn.getText(botstr.stop_text_ManyLotteryStopSuccess));
                            }
                            else {
                                db.run(`UPDATE gamekeys SET getdiscord_id="lot",getdiscord_nickname=NULL WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="lotrun"`);
                                //strshow = `${botfn.getText(botstr.show_text_FormatNameAuthor, [row.id, row.NameOfGame, row.discord_nickname])}`;
                                message.reply(botfn.getText(botstr.stop_text_LotteryStopSuccess, inId));
                            }
                        }
                        else {
                            DEBUGLOG(`OUT STOP Key not Found. (!row)[${inId}]`);
                            message.reply(botfn.getTextErr(botstr.err_text_KeyLotteryRunNotFound));
                        }
                    }
                });
            }
            else if (command.cmd === "status") {
                let chanelId = ``;
                let channels = new Map();

                for (let [key, value] of client.guilds.get(message.channel.guild.id).channels) {
                    if (value.type == `text`) {
                        chanelId += (chanelId === ``) ? `"${key}"` : `,"${key}"`;
                        channels.set(key, {
                            name: value.name,
                            numkeys: 0,
                            numoutkeys: 0,
                            numrunlot: 0
                        });
                    }
                }

                db.all(`SELECT discord_id,discord_nickname,discord_channel,getdiscord_id FROM gamekeys WHERE discord_channel IN (${chanelId}) AND (getdiscord_id != "lot" OR getdiscord_id IS NULL)`).then(rows => {
                    if (!rows || rows.length == 0) {
                        DEBUGLOG(`OUT STATUS Key not Found. (!rows)`);
                        message.reply(botfn.getTextErr(botstr.err_text_KeyNotFound));
                    }
                    else {
                        let autors = new Map();
                        let NumKeys = 0;
                        let NumOutKeys = 0;
                        let NumRunLot = 0;

                        for (let i = 0; i < rows.length; i++) {
                            if (!autors.has(rows[i].discord_id)) {
                                autors.set(rows[i].discord_id, {
                                    nickname: rows[i].discord_nickname,
                                    numkeys: 0,
                                    numoutkeys: 0
                                });
                            }

                            if (rows[i].getdiscord_id == `lotrun`) {
                                channels.get(rows[i].discord_channel).numrunlot++;
                                NumRunLot++;
                            }
                            else if (rows[i].getdiscord_id != null) {
                                autors.get(rows[i].discord_id).numkeys++;
                                autors.get(rows[i].discord_id).numoutkeys++;
                                channels.get(rows[i].discord_channel).numoutkeys++;
                                NumOutKeys++;
                            }
                            else if (rows[i].getdiscord_id == null) {
                                autors.get(rows[i].discord_id).numkeys++;
                                channels.get(rows[i].discord_channel).numkeys++;
                                NumKeys++;
                            }

                        }

                        let statnumkeys = ``;
                        let statnumoutkeys = ``;
                        let statnumrunlot = ``;
                        for (let [key, value] of channels) {
                            if (value.numkeys > 0)
                                statnumkeys += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numkeys])}\n`;
                            if (value.numoutkeys > 0)
                                statnumoutkeys += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numoutkeys])}\n`;
                            if (value.numrunlot > 0)
                                statnumrunlot += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numrunlot])}\n`;
                        }
                        let Id_1, Val_1 = 0;
                        let Id_2, Val_2 = 0;
                        let Id_3, Val_3 = 0;
                        let statautors = ``;
                        for (let [key, value] of autors) {
                            if (value.numkeys > Val_1) {
                                Id_3 = Id_2;
                                Val_3 = Val_2;
                                Id_2 = Id_1;
                                Val_2 = Val_1;
                                Id_1 = key;
                                Val_1 = value.numkeys;
                            }
                            else if (value.numkeys > Val_2) {
                                Id_3 = Id_2;
                                Val_3 = Val_2;
                                Id_2 = key;
                                Val_2 = value.numkeys;
                            }
                            else if (value.numkeys > Val_3) {
                                Id_3 = key;
                                Val_3 = value.numkeys;
                            }
                        }
                        if (autors.get(Id_1)) {
                            statautors += `${botfn.getText(botstr.status_text_FormatAuthors, [autors.get(Id_1).nickname, autors.get(Id_1).numoutkeys, autors.get(Id_1).numkeys])}\n`;
                        }
                        if (autors.get(Id_2)) {
                            statautors += `${botfn.getText(botstr.status_text_FormatAuthors, [autors.get(Id_2).nickname, autors.get(Id_2).numoutkeys, autors.get(Id_2).numkeys])}\n`;
                        }
                        if (autors.get(Id_3)) {
                            statautors += `${botfn.getText(botstr.status_text_FormatAuthors, [autors.get(Id_3).nickname, autors.get(Id_3).numoutkeys, autors.get(Id_3).numkeys])}\n`;
                        }

                        let StatusRichEmbed = new Discord.RichEmbed();
                        StatusRichEmbed.setColor(botstr.status_color);
                        StatusRichEmbed.setTitle(botstr.status_text_Title);
                        StatusRichEmbed.setDescription(botfn.getText(botstr.status_text_Description, `${message.channel.guild.name}`));
                        StatusRichEmbed.setThumbnail(message.channel.guild.iconURL);
                        StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumKeys, `${NumKeys}`), statnumkeys || botstr.status_text_NoChannels, true);
                        StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumOutKeys, `${NumOutKeys}`), statnumoutkeys || botstr.status_text_NoChannels, true);
                        StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumLotRun, `${NumRunLot}`), statnumrunlot || botstr.status_text_NoChannels);
                        StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumAuthors, `${autors.size}`), statautors || botstr.status_text_NoAuthors);
                        DEBUGLOG(`OUT STATUS send status.`);
                        message.channel.send(StatusRichEmbed.setFooter(BOTVERSION));
                    }
                });
            }
            else {
                DEBUGLOG(`OUT ERROR Command not found! "${command.cmd}"`);
                message.reply(botfn.getText(botstr.err_text_WrongUseCommandOrUnknownCommand, command.cmd));
            }
        }
    }
    else if (message.channel.type === "dm") {
        DEBUGLOG(`IN (${message.channel.type})\$ ${message.author.username}: "${message.content}"`);
        var command = botfn.getCommand(message.content);

        if (command.err) {
            DEBUGLOG(`OUT ERROR "${command.prm}"`);
            message.reply(command.prm);
        }
        else if (command.cmd === "help") {
            DEBUGLOG(`OUT HELP embed "${command.scmd}"`);
            message.author.send(new Discord.RichEmbed(botfn.getHelp(command)).setFooter(BOTVERSION));
        }
        else if (command.cmd === "ping") {
            DEBUGLOG(`OUT pong"`);
            message.author.send("pong");
        }
        else if (command.cmd === "about") {
            DEBUGLOG(`OUT ABOUT embed "${command.cmd}"`);
            message.author.send(new Discord.RichEmbed(botfn.getAboutEmbed(client.user.avatarURL)).setFooter(BOTVERSION));
        }
        else {
            //Команды требующие предварительной авторизации
            db.get(`SELECT discord_id,discord_channel FROM authors WHERE discord_id="${message.author.id}"`).then(arow => {
                if (!arow) {
                    DEBUGLOG(`OUT You not in base. Send addme`);
                    message.reply(botstr.err_text_NotFoundInAuthorBase);
                }
                else if (command.cmd === "show") {
                    var request = "";
                    var inSubCommand = command.scmd;

                    var jarr = 0;
                    var istart = 0;

                    if (inSubCommand === "next" && ShowNextMap.has(message.channel.id)) {
                        istart = ShowNextMap.get(message.channel.id).num;
                        request = ShowNextMap.get(message.channel.id).req;
                    }
                    else if (inSubCommand === "my") {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and discord_channel="${arow.discord_channel}" and (getdiscord_id IS NULL or getdiscord_id="lot" or getdiscord_id="lotrun")`;
                    }
                    else if (inSubCommand === "key") {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id IS NULL)`;
                    }
                    else if (inSubCommand === "lot") {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id="lot")`;
                    }
                    else if (inSubCommand === "lotrun") {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id="lotrun")`;
                    }
                    else {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot" or getdiscord_id="lotrun")`;
                    }

                    if (istart == 0) {
                        if (ShowNextMap.has(message.channel.id)) {
                            ShowNextMap.get(message.channel.id).num = 0;
                            ShowNextMap.get(message.channel.id).req = request;
                        }
                    }

                    db.all(request).then(row => {
                        if (!row) {
                            DEBUGLOG(`OUT SHOW Not found all key. (!row)`);
                            message.reply(botstr.err_text_KeyNotFound);
                        }
                        else {
                            var strshow = istart > 0 ? "...\n" : "";

                            for (var i = istart; i < row.length; i++) {
                                if (`${strshow}${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey])}\n`.length < 1500) {
                                    showprefix = row[i].discord_channel != arow.discord_channel ? "*" : "";

                                    if (row[i].getdiscord_id === "lot") {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}(L)`])}\n`;
                                    }
                                    else if (row[i].getdiscord_id === "lotrun") {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}(R)`])}\n`;
                                    }
                                    else {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}`])}\n`;
                                    }
                                }
                                else {
                                    if (ShowNextMap.has(message.channel.id)) {
                                        ShowNextMap.get(message.channel.id).num = i;
                                        ShowNextMap.get(message.channel.id).req = request;
                                    }
                                    else {
                                        ShowNextMap.set(message.channel.id, {
                                            num: i,
                                            req: request
                                        });
                                    }
                                    strshow += `...`;
                                    break;
                                }
                            }

                            if (strshow === "") {
                                DEBUGLOG(`OUT SHOW Not found key.`);
                                message.reply(botstr.err_text_KeyNotFound);
                            }
                            else {
                                DEBUGLOG(`OUT SHOW Found key.`);
                                //message.reply(botfn.getText(botstr.show_text_KeyFound, strshow));
                                message.author.send(botfn.getText(botstr.show_text_KeyFound, strshow));
                            }
                        }
                    });
                }
                else if (command.cmd === "add") {
                    var inGameKey = command.key;
                    var inGameName = command.name.substr(0, 50);
                    var request = "";
                    let lott = command.scmd == `lot` ? `lot` : null;

                    if ((inGameKey != "") && (inGameName != "")) {
                        db.get(`SELECT id,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and NameOfGame="${inGameName}" and GameKey="${inGameKey}"`).then(row => {
                            if (!row) {
                                db.run("INSERT INTO gamekeys (discord_id, discord_nickname, discord_channel, NameOfGame, GameKey, getdiscord_id) VALUES (?,?,?,?,?,?)", [message.author.id, message.author.username, arow.discord_channel, inGameName, inGameKey, lott]);
                                db.get("SELECT id,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE rowid=last_insert_rowid()").then(addrow => {
                                    if (addrow.getdiscord_id == "lot") {
                                        strshow = `${botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [addrow.id, addrow.NameOfGame, addrow.GameKey, `(L)`]))}`;
                                        DEBUGLOG(`OUT ADD added lot. ${strshow}`);
                                        message.reply(botfn.getText(botstr.addlot_text_AddKeySuccess, strshow));
                                    }
                                    else {
                                        strshow = `${botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [addrow.id, addrow.NameOfGame, addrow.GameKey]))}`;
                                        DEBUGLOG(`OUT ADD added key. ${strshow}`);
                                        message.reply(botfn.getText(botstr.addkey_text_AddKeySuccess, strshow));
                                    }

                                });
                            }
                            else {
                                if (row.getdiscord_id == "lot") {
                                    strshow = `${botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [row.id, row.NameOfGame, row.GameKey, `(L)`]))}`;
                                    DEBUGLOG(`OUT ADDKEY ERROR err Added lot. Found ${strshow}`);
                                    message.reply(botfn.getText(botstr.addlot_text_AddKeyFound, strshow));
                                }
                                else {
                                    strshow = `${botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [row.id, row.NameOfGame, row.GameKey]))}`;
                                    DEBUGLOG(`OUT ADDKEY ERROR err Added key. Found ${strshow}`);
                                    message.reply(botfn.getText(botstr.addkey_text_AddKeyFound, strshow));
                                }
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
                else if (command.cmd === "set") {
                    var inId = command.id;
                    var lott = command.scmd == `lot` ? true : false;
                    var reqId = botfn.getIdRequest(inId);

                    if (inId != "") {
                        db.all(`SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE (${reqId}) and discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot")`).then(row => {
                            if (!row) {
                                DEBUGLOG(`OUT SETKEY ERROR id Not Found. (!row) [${inId}]`);
                                message.reply(botstr.err_text_KeyNotFound);
                            }
                            else {

                                if (lott) {
                                    db.run(`UPDATE gamekeys SET getdiscord_id="lot" WHERE (${reqId}) and discord_id="${message.author.id}" and getdiscord_id IS NULL`);
                                }
                                else {
                                    db.run(`UPDATE gamekeys SET getdiscord_id=NULL WHERE (${reqId}) and discord_id="${message.author.id}" and getdiscord_id="lot"`);
                                }

                                var strshow = "";
                                for (var i = 0; i < row.length; i++) {
                                    showprefix = row[i].discord_channel != arow.discord_channel ? "*" : "";

                                    if (lott) {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}(L)`])}\n`;
                                    }
                                    else {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}`])}\n`;
                                    }
                                }
                                if (strshow === "") {
                                    DEBUGLOG(`OUT SET Not found key.`);
                                    message.reply(botstr.err_text_KeyNotFound);
                                }
                                else {
                                    DEBUGLOG(`OUT SET Found key.`);
                                    if (row.length > 1) {
                                        message.reply(botfn.getText(botstr.set_text_UpdateKeySuccess_ManyKeys, botfn.getText(botstr.show_text_KeyFound, strshow)));
                                    }
                                    else {
                                        message.reply(botfn.getText(botstr.set_text_UpdateKeySuccess_OneKey, botfn.getText(botstr.show_text_KeyFound, strshow)));
                                    }
                                }
                            }
                        });
                    }
                }
                else if (command.cmd === "del") {
                    var inId = command.id;
                    var reqId = botfn.getIdRequest(inId);

                    if (inId != "") {
                        db.all(`SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE (${reqId}) and discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot")`).then(row => {
                            if (!row) {
                                DEBUGLOG(`OUT DEL Del key not found. (!row) [${inId}]`);
                                message.reply(botfn.getText(botstr.err_text_IndexKeyNotFound, inId));
                            }
                            else {
                                db.run(`DELETE FROM gamekeys WHERE (${reqId}) and discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot")`);
                                var strshow = "";
                                for (var i = 0; i < row.length; i++) {
                                    showprefix = row[i].discord_channel != arow.discord_channel ? "*" : "";

                                    if (row[i].getdiscord_id === "lot") {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}(L)`])}\n`;
                                    }
                                    else {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}`])}\n`;
                                    }
                                }
                                if (strshow === "") {
                                    DEBUGLOG(`OUT DEL Not found key.`);
                                    message.reply(botstr.err_text_KeyNotFound);
                                }
                                else {
                                    DEBUGLOG(`OUT DEL Found key.`);
                                    if (row.length > 1) {
                                        message.reply(botfn.getText(botstr.del_text_DelSuccess_ManyKeys, botfn.getText(botstr.show_text_KeyFound, strshow)));
                                    }
                                    else {
                                        message.reply(botfn.getText(botstr.del_text_DelSuccess_OneKey, botfn.getText(botstr.show_text_KeyFound, strshow)));
                                    }
                                }
                            }
                        });
                    }
                }
                else if (command.cmd === "whereme") {
                    if (client.channels.get(arow.discord_channel)) {
                        DEBUGLOG(`OUT WHEREME Found: "${client.channels.get(arow.discord_channel).guild.name}"->"${client.channels.get(arow.discord_channel).name}"`);
                        message.reply(botfn.getText(botstr.whereme_text_FoundSuccess, [client.channels.get(arow.discord_channel).guild.name, client.channels.get(arow.discord_channel).name]));
                    }
                    else {
                        DEBUGLOG(`OUT WHEREME Channel or server Not Found`);
                        message.reply(botstr.err_text_AuthorNotFound);
                    }
                }
                else if (command.cmd === "status") {
                    db.all(`SELECT discord_channel,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}"`).then(rows => {
                        if (!rows || rows.length == 0) {
                            DEBUGLOG(`OUT STATUS Key not Found. (!rows)`);
                            message.reply(botfn.getTextErr(botstr.err_text_KeyNotFound));
                        }
                        else {
                            let NumKeys = 0;
                            let NumOutKeys = 0;
                            let NumLot = 0;
                            let NumRunLot = 0;

                            let channels = new Map();

                            for (let i = 0; i < rows.length; i++) {
                                if (!channels.has(rows[i].discord_channel)) {
                                    channels.set(rows[i].discord_channel, {
                                        name: client.channels.get(rows[i].discord_channel).name,
                                        numkeys: 0,
                                        numoutkeys: 0,
                                        numlot: 0,
                                        numrunlot: 0
                                    });
                                }

                                if (rows[i].getdiscord_id == `lot`) {
                                    channels.get(rows[i].discord_channel).numlot++;
                                    NumLot++;
                                }
                                else if (rows[i].getdiscord_id == `lotrun`) {
                                    channels.get(rows[i].discord_channel).numrunlot++;
                                    NumRunLot++;
                                }
                                else if (rows[i].getdiscord_id != null) {
                                    channels.get(rows[i].discord_channel).numoutkeys++;
                                    NumOutKeys++;
                                }
                                else if (rows[i].getdiscord_id == null) {
                                    channels.get(rows[i].discord_channel).numkeys++;
                                    NumKeys++;
                                }
                            }

                            let statnumkeys = ``;
                            let statnumoutkeys = ``;
                            let statnumlot = ``;
                            let statnumrunlot = ``;

                            for (let [key, value] of channels) {
                                if (value.numkeys > 0)
                                    statnumkeys += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numkeys])}\n`;
                                if (value.numoutkeys > 0)
                                    statnumoutkeys += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numoutkeys])}\n`;
                                if (value.numlot > 0)
                                    statnumlot += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numlot])}\n`;
                                if (value.numrunlot > 0)
                                    statnumrunlot += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numrunlot])}\n`;
                            }


                            let StatusRichEmbed = new Discord.RichEmbed();
                            StatusRichEmbed.setColor(botstr.status_color);
                            StatusRichEmbed.setTitle(botstr.status_text_Title);
                            StatusRichEmbed.setDescription(botfn.getText(botstr.whereme_text_FoundSuccess, [client.channels.get(arow.discord_channel).guild.name, client.channels.get(arow.discord_channel).name]));
                            StatusRichEmbed.setThumbnail(message.author.avatarURL);
                            StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumKeys, `${NumKeys}`), statnumkeys || botstr.status_text_NoChannels, true);
                            StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumOutKeys, `${NumOutKeys}`), statnumoutkeys || botstr.status_text_NoChannels, true);
                            StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumLot, `${NumLot}`), statnumoutkeys || botstr.status_text_NoChannels, true);
                            StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumLotRun, `${NumRunLot}`), statnumrunlot || botstr.status_text_NoChannels, true);

                            DEBUGLOG(`OUT STATUS send status.`);
                            message.author.send(StatusRichEmbed.setFooter(BOTVERSION));
                        }
                    });
                }
                else {
                    DEBUGLOG(`OUT ERROR. Command not found! "${command.cmd}"`);
                    message.reply(botfn.getText(botstr.err_text_WrongUseCommandOrUnknownCommand, command.cmd));
                }
            });
        }
    }
});

client.on('messageReactionAdd', (messageReaction, user) => {
    if (user === client.user) return;
    if (ArrLottery.length > 0) {
        for (var i = 0; i < ArrLottery.length; i++) {
            if (ArrLottery[i].msg.id === messageReaction.message.id) {
                db.get(`SELECT id,lotmessage_id,discord_id,discord_channel,discord_nickname FROM lottery WHERE lotmessage_id="${messageReaction.message.id}" and discord_id="${user.id}"`).then(row => {
                    if (!row) {
                        DEBUGLOG(`INSIDE Added reaction. [${ArrLottery[i].id}] ${user.username}`);
                        db.run("INSERT INTO lottery (lotkey_id,lotmessage_id,discord_id,discord_channel,discord_nickname) VALUES (?,?,?,?,?)", [ArrLottery[i].id, messageReaction.message.id, user.id, messageReaction.message.channel.id, user.username]);
                    }
                });
                break;
            }
        }
    }
});

client.on('messageReactionRemove', (messageReaction, user) => {
    if (user === client.user) return;
    if (ArrLottery.length > 0) {
        DEBUGLOG(`INSIDE Deleted reaction. ${user.username}`);
        db.run(`DELETE FROM lottery WHERE lotmessage_id="${messageReaction.message.id}" and discord_id="${user.id}"`);
    }
});


db.open(config.database);
client.login(config.token);

