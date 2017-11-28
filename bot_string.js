
module.exports.err_text_Prefix                          = "Ошибка!";
module.exports.err_text_NotSetInStr                     = "Не задана входная строка.";
module.exports.err_text_WrongUseCommand                 = "Неправильное использование команды `${0}`${1}. Наберите `help ${0}` чтобы узнать подробности.";
module.exports.err_text_WrongUseCommand_UnsetIndex      = "не указан индекс";
module.exports.err_text_WrongUseCommand_WrongIndex      = "неправильно указан индекс";
module.exports.err_text_WrongUseCommand_UnsetTime       = "не указано время";
module.exports.err_text_WrongUseCommand_WrongTime       = "неправильно указано время";
module.exports.err_text_WrongUseCommand_UnsetName       = "не указано имя игры";
module.exports.err_text_WrongUseCommand_UnsetKey        = "не указан ключ для игры";
module.exports.err_text_UnknownCommand                  = "Неизвестная команда \"${}\". Наберите `help` чтобы узнать доступные команды.";
module.exports.err_text_WrongUseCommandOrUnknownCommand = "Неизвестная команда или неправильное использование `${}`";

module.exports.err_text_KeyNotFound                     = "Не найдено добавленных ключей. Либо все разобрали либо не добавлялись новые ключи.";
module.exports.err_text_KeyLotteryNotFound              = "Не найдено добавленных ключей. Либо все разобрали либо не добавлялись новые лотерейные ключи.";
module.exports.err_text_KeyLotteryRunNotFound           = "Не найдено запущенных лотерейных ключей.";
module.exports.err_text_KeyNotFoundForChannel           = "Не найдено ключей для этого канала.";

module.exports.err_text_LotteryRandom                   = "Ошибка лотереи. Неправильно сработал розыгрыш.";
module.exports.err_text_LotteryKeyNotFound              = "Ошибка лотереи. Не могу найти игру с индексом [${}]";
module.exports.err_text_LotteryStopped                  = "Ошибка лотереи. Запущенная лотерея [${}] не найдена.";

module.exports.err_text_NotFoundInAuthorBase            = "Ты не добавлен в базу. Напиши мне `addme` с канала на котором хочешь делиться ключами.";

module.exports.err_text_IndexKeyNotFound                = "Не могу найти ключ с индексом [${}]";
module.exports.err_text_IndexKeyLotteryNotFound         = "Не могу найти лотерейный ключ с индексом [${}]";

module.exports.err_text_AuthorNotFound                  = "Ты есть в базе, но канал найти не удалось. Возможно, бот удален с того канала, на котором ты регистрировался. Чтобы обновить данные напиши мне `addme` с канала, на котором хочешь делиться ключами.";
module.exports.err_text_FoundLotteryRunAfterStart       = "Бот был перезапущен. Запущенные тобой лотереи остановлены. Их можно снова запустить командой `start`. `${}`";

module.exports.addme_text_AddingSuccess                 = "Ты добавлен в базу. А я готов принимать ключи. Доступные команды можно посмотреть отправив мне __help__ или __?__.";
module.exports.addme_text_UpdateSuccess                 = "Ты уже есть в базе. Но пишешь с другого канала. Привязка к каналу изменена.";
module.exports.addme_text_FoundInBase                   = "Ты уже есть в базе.";

module.exports.show_text_FormatNameKey                  = "${0}. ${3}[${1}][${2}]";
module.exports.show_text_FormatNameAuthor               = "${0}. ${3}[${1}](${2})";
module.exports.show_text_KeyFound                       = "```Markdown\n${}```";

module.exports.getkey_text_KeyFoundSendChannel          = "Ключ от игры `${0}` ушел пользователю ${1}.";
module.exports.getkey_text_KeyFoundSendUser             = "За ключ благодари ${1}. Ключ от игры: ${0}";

module.exports.start_text_LotteryStartedTitle           = "Запущена лотерея!";
module.exports.start_text_LotteryStartedText            = "Через **${0}** ключ автоматически пошлется одному из тех кто поставит любой emoji под этим сообщением.\n${1}";
//Цвета могут быть представлены в нескольких видах 0xNNNNNN или десятичное представления, [0xNN,0xNN,0xNN] или соответствующие десятичные представления
module.exports.start_color_LotteryStarted               = [41,176,38]
module.exports.start_color_LotteryStopped               = 12264741

//module.exports.start_text_LotteryStarted                = "@here\n```Markdown\n# Запущена лотерея.\nЧерез ${0} ключ автоматически отошлется одному из тех кто поставит любой emoji под этим сообщением.\n${1}```";
module.exports.start_text_LotteryStoppedNoReaction      = "Лотерея `${}` остановлена. Никто не отметился.";
module.exports.start_text_LotteryStoppedSuccess         = "Лотерея окончена!";

module.exports.stop_text_LotteryStopSuccess             = "Лотерея `${}` остановлена.";
module.exports.stop_text_ManyLotteryStopSuccess         = "Лотереи остановлены.";

module.exports.addkey_text_AddKeySuccess                = "Ключ добавлен.\n${}";
module.exports.addkey_text_AddKeyFound                  = "Такой ключ уже есть.\n${}";
module.exports.addlot_text_AddKeySuccess                = "Лотерейный ключ добавлен.\n${}";
module.exports.addlot_text_AddKeyFound                  = "Такой лотерейный ключ уже есть.\n${}";

module.exports.del_text_DelSuccess_OneKey               = "Ключ удален\n${}";
module.exports.del_text_DelSuccess_ManyKeys             = "Ключи удалены\n${}";

module.exports.set_text_UpdateKeySuccess_OneKey         = "Ключ обновлен\n${}";
module.exports.set_text_UpdateKeySuccess_ManyKeys       = "Ключи обновлены\n${}";

module.exports.whereme_text_FoundSuccess                = "Ты зарегистрирован на сервере **${0}** канал **#${1}**";

module.exports.status_color                             = 614259;
module.exports.status_text_Title                        = "Статус";
module.exports.status_text_Description                  = "Имя сервера **${0}**";
module.exports.status_text_FieldNumKeys                 = "Доступно ключей: ${0}";
module.exports.status_text_FieldNumOutKeys              = "Ключей роздано: ${0}";
module.exports.status_text_FieldNumLot                  = "Доступно лотерей: ${0}";
module.exports.status_text_FieldNumLotRun               = "Запущено лотерей: ${0}";
module.exports.status_text_FieldNumAuthors              = "Топ 3 авторов из ${0}";
module.exports.status_text_NoChannels                   = "Нет каналов";
module.exports.status_text_NoAuthors                    = "Нет авторов";
module.exports.status_text_FormatChannelKeys            = "#${0} - ${1}";
module.exports.status_text_FormatAuthors                = "@${0} - ${1}/${2}";


module.exports.help_text_TitleCommand                   = "Команда **__${}__**";
module.exports.help_text_DescriptionUsing               = "Использование:";
//Посмотреть как будет выглядить сообщение можно тут https://leovoel.github.io/embed-visualizer/
//Можно удалить все кроме "description". После двоеточия вставить одну из строк ниже.
module.exports.help_text_ShortHelp                      = "help КОМАНДА|Вывести помощь по определенной команде.|addme|Добавить себя в базу данных как автор ключей.|whereme|Вывести сервер и канал к которому ты привязан.|status|Вывести информацию по серверу|getkey ИНДЕКС|Получить ключ от игры по индексу.|show|Показать доступные ключи.|showmy|Показать все доступные ключи которые ты добавил для данного канала.|showkey|Показать все ключи которые ты добавил.|showlot|Показать все лотерейные ключи которые ты добавил.|showlotrun|Показать все запущенные лотереи которые ты добавил.|shownext|Дальнейший вывод соответствующей команды.|addkey НАЗВАНИЕ_ИГРЫ КЛЮЧ|Добваить ключ для игры.|addlot НАЗВАНИЕ_ИГРЫ КЛЮЧ|Добавить лотерейный ключ для игры.|setkey ИНДЕКС|Установить лотерейный ключ как обычный ключ от игры по индексу.|setlot ИНДЕКС|Установить ключ как лотерейный ключ от игры по индексу.|del ИНДЕКС|Удалить любой ключ от игры по индексу.|start ИНДЕКС ВРЕМЯ|Запустить лотерею на определенное время.|stop ИНДЕКС|Остановить запущенную лотерею."
//module.exports.help_text_ShortHelp                      = "```Markdown\n* help КОМАНДА\n> Вывести помощь по определенной команде.\n* addme\n> Добавить себя в базу данных как автор ключей.\n* getkey ИНДЕКС\n> Получить ключ от игры по индексу.\n* show\n> Показать доступные ключи.\n* showmy\n> Показать все доступные ключи которые ты добавил для данного канала.\n* start ИНДЕКС ВРЕМЯ \n> Запустить лотерею на определенное время.\n* stop ИНДЕКС\n> Остановить запущенную лотерею.\n* addkey НАЗВАНИЕ_ИГРЫ КЛЮЧ\n> Добваить ключ для игры.\n* addlot НАЗВАНИЕ_ИГРЫ КЛЮЧ\n> Добавить лотерейный ключ для игры.\n* showkey\n> Показать все ключи которые ты добавил.\n* showlot\n> Показать все лотерейные ключи которые ты добавил.\n* showlotrun\n> Показать все запущенные лотереи которые ты добавил.\n* del ИНДЕКС\n> Удалить любой ключ от игры по индексу.\n* delkey ИНДЕКС\n> Удалить не лотерейный ключ от игры по индексу.\n* dellot ИНДЕКС\n> Удалить лотерейный ключ от игры по индексу.\n* setkey ИНДЕКС\n> Установить лотерейный ключ как обычный ключ от игры по индексу.\n* setlot ИНДЕКС\n> Установить ключ как лотерейный ключ от игры по индексу.```"
//module.exports.help_text_ShortHelp                      = "**help КОМАНДА**\n> Вывести помощь по определенной команде.\n**addme**\n> Добавить себя в базу данных как автор ключей.\n**getkey ИНДЕКС**\n> Получить ключ от игры по индексу.\n**show**\n> Показать доступные ключи.\n**showmy**\n> Показать все доступные ключи которые ты добавил для данного канала.\n**start ИНДЕКС ВРЕМЯ**\n> Запустить лотерею на определенное время.\n**stop ИНДЕКС**\n> Остановить запущенную лотерею.\n**addkey НАЗВАНИЕ_ИГРЫ КЛЮЧ**\n> Добваить ключ для игры.\n**addlot НАЗВАНИЕ_ИГРЫ КЛЮЧ**\n> Добваить лотерейный ключ для игры.\n**showkey**\n> Показать все ключи которые ты добавил.\n**showlot**\n> Показать все лотерейные ключи которые ты добавил.\n**showlotrun**\n> Показать все запущенные лотереи которые ты добавил.\n**del ИНДЕКС**\n> Удалить любой ключ от игры по индексу.\n**delkey ИНДЕКС**\n> Удалить не лотерейный ключ от игры по индексу.\n**dellot ИНДЕКС**\n> Удалить лотерейный ключ от игры по индексу.\n**setkey ИНДЕКС**\n> Установить лотерейный ключ как обычный ключ от игры по индексу.\n**setlot ИНДЕКС**\n> Установить ключ как лотерейный ключ от игры по индексу."
module.exports.help_text_Help                           = "```Markdown\nhelp\n> Вывести это сообщение.```\n```Markdown\n?\n> Вывести короткую справку по всем командам.```\n```Markdown\nhelp КОМАНДА, ? КОМАНДА, КОМАНДА help, КОМАНДА ?\n> Вывести помощь по определенной команде.```\nДоступные команды:\n```Markdown\n* show\n* showmy\n* showkey\n* showlot\n* showlotrun\n* shownext\n# Только в общем чате:\n* addme\n* getkey ИНДЕКС\n* start ИНДЕКС ВРЕМЯ\n* stop ИНДЕКС\nstatus\n# Только в личке:\n* whereme\n* addkey НАЗВАНИЕ_ИГРЫ КЛЮЧ\n* addlot НАЗВАНИЕ_ИГРЫ КЛЮЧ\n* setkey ИНДЕКС\n* setlot ИНДЕКС\n* del ИНДЕКС```"
module.exports.help_text_Addme                          = "```Markdown\naddme\n> Добавить себя в базу данных как автор ключей.```\nРаботает только в *общем чате*, привязывая автора к этому чату.\nЧтобы изменить привязку надо отправить __addme__ с того канала, к которому хочется иметь привязку.\nПривязка дает возможность раздавать ключи на том канале, к которому привязан. При изменении привязки ключи остаются доступны для того канала, к которому изначально были привязаны."
module.exports.help_text_Whereme                        = "```Markdown\nwhereme\n> Вывести сервер и канал к которому ты привязан.```\nЕсли бот удален из канала или канал удалили, бот вернет ошибку. Чтобы привязать себя к другому каналу, в котором есть бот, отправь ему команду __addme__ из того канала, к которому хочешь привязаться.\nКоманда работает только в *личке*.";
module.exports.help_text_Status                         = "```Markdown\nstatus\n# В общем чате\n> Вывести информацию по серверу.\n# В личке\n> Вывести информацию по тебе.```";
module.exports.help_text_Getkey                         = "```Markdown\ngetkey ИНДЕКС, gk ИНДЕКС\n> Получить ключ от игры по индексу.```\n**ИНДЕКС** можно узнать командой __show__. Работает только в *общем чате*."
module.exports.help_text_Show                           = "```Markdown\nshow, sh\n# В общем чате\n> Показать все доступные ключи для данного канала.\n# В личке\n> Показать все ключи, которые ты добавил.```\nПрефиксы перед ключами:\n**без префикса** - Обычный ключ, который может забрать любой набравший команду __getkey__\n***** - Добавленный ключ, который относиться к другому каналу (не к тому, с которого последний раз отправлялась команда __addme__).\n**L** - Лотерейный ключ. Его можно отдать только разыграв.\n**R** - Лотерейный ключ, для которого в данный момент проходит лотерея. Его нельзя удалить командой __del__ пока лотерея не остановлена."
module.exports.help_text_Showmy                         = "```Markdown\nshowmy, show my, showm, shm, sm, my\n# В общем чате\n> Показать все доступные ключи, которые ты добавил для данного канала.\n# В личке\n> Показать все ключи для канала, к которому ты привязан.```"
module.exports.help_text_Showkey                        = "```Markdown\nshowkey, show key, showk, shk, sk, key\n# В общем чате\n> Показать все доступные ключи для данного канала.\n# В личке\n> Показать все ключи, которые ты добавил (фильтруя лотерейные ключи и запущенные лотереи).```\n"
module.exports.help_text_Showlot                        = "```Markdown\nshowlot, show lot, showl, shl, sl, lottery, lot\n# В общем чате\n> Показать все запущенные лотереи в этом канале\n# В личке\n> Показать все лотерейные ключи, которые ты добавил (фильтруя ключи и запущенные лотереи).```\n"
module.exports.help_text_Showlotrun                     = "```Markdown\nshowlotrun, show lotrun, showlr, shlr, slr, lotteryrun, lotrun, run\n# В общем чате\n> Показать все запущенные лотереи в этом канале\n# В личке\n> Показать все запущенные лотереи, которые ты запустил и которые идут в данный момент.```\n"
module.exports.help_text_Shownext                       = "```Markdown\nshownext, show next, shown, shn, sn, next\n# После команд: show, showmy, showkey, showlot, showlotrun\n> Дальнейший вывод соответствующей команды.\n# Иначе\n> Команда аналогична команде show.```Если после вызова одной из команд: __show__, __showmy__, __showkey__, __showlot__, __showlotrun__ или __shownext__, вывод команды заканчиваеться многоточием `...`, то команда __shownext__ выводит следующие или оставшиеся ключи.\nЕсли перед вызовом команды __shownext__ нет вызовов команд: __show__, __showmy__, __showkey__, __showlot__, __showlotrun__, то команда выводит ключи аналогично команде __show__."
module.exports.help_text_Addkey                         = "```Markdown\naddkey НАЗВАНИЕ_ИГРЫ КЛЮЧ\n> Добавить ключ для игры.```\n**НАЗВАНИЕ ИГРЫ** может быть любым с пробелами и спец символами.\n**КЛЮЧ** может быть любым, но должен **идти последним** и **не содержать пробелов**.\nКоманда сработает только если до этого ты был добавлен командой __addme__.\nКоманда работает только в *личке*.\nПримеры:\n```addkey Game Name KEYFO-RTHIS-NAMEG-AME32\naddkey This's Another Mega Cool Game http://example.com```"
module.exports.help_text_Addlot                         = "```Markdown\naddlot НАЗВАНИЕ_ИГРЫ КЛЮЧ\n> Добавить лотерейный ключ для игры.```\n**НАЗВАНИЕ ИГРЫ** может быть любым с пробелами и спец символами.\n**КЛЮЧ** может быть любым, но должен **идти последним** и **не содержать пробелов**.\nКоманда сработает только если до этого ты был добавлен командой __addme__.\nКоманда работает только в *личке*.\nПримеры:\n```addkey Game Name KEYFO-RTHIS-NAMEG-AME32\naddkey This's Another Mega Cool Game http://example.com```"
module.exports.help_text_Setkey                         = "```Markdown\nsetkey ИНДЕКС\n> Установить лотерейный ключ как обычный ключ от игры по индексу.```\n**ИНДЕКС** можно узнать командой __show__ или __showlot__. Можно задать несколько индексов через запятую или пробел, или диапазон через тире.\nКоманда работает только в *личке*.\nПримеры:\n```setkey 25\nsetkey 25 36,47\nsetkey 26-37\nsetkey 23,26-47 50```"
module.exports.help_text_Setlot                         = "```Markdown\nsetlot ИНДЕКС\n> Установить ключ как лотерейный ключ от игры по индексу.```\n**ИНДЕКС** можно узнать командой __show__ или __showkey__. Можно задать несколько индексов через запятую или пробел, или диапазон через тире.\nКоманда работает только в *личке*.\nПримеры:\n```setlot 25\nsetlot 25 36,47\nsetlot 26-37\nsetlot 23,26-47 50```";
module.exports.help_text_Del                            = "```Markdown\ndel ИНДЕКС\n> Удалить любой ключ от игры по индексу.```\n**ИНДЕКС** можно узнать командой __show__. Можно задать несколько индексов через запятую или пробел, или диапазон через тире.\nКоманда работает только в *личке*.\nПримеры:\n```del 25\ndel 25 36,47\ndel 26-37\ndel 23,26-47 50```"
module.exports.help_text_Start                          = "```Markdown\nstart ИНДЕКС ВРЕМЯ\n> Запустить лотерею на определенное время.```\n**ИНДЕКС** можно узнать командой __show__ или __showlot__ в личке (ключи с префиксом **L**). Можно задать несколько индексов через запятую или пробел, или диапазон через тире.\n**ВРЕМЯ** задается в формате **XT**, где ```Markdown\n'X' - цифра от 0 до 9999\n'T' - модификатор принимающий одно из значений:\n   * h - часы\n   * m - минуты\n   * s - секунды```Можно задавать несколько параметров `ВРЕМЯ` подряд, они будут складываться. Максимальное время - 24 часа.\nКоманда работает только в *общем чате*.\nПримеры:\n```start 25 30m\nstart 25 36,47 1h15m\nstart 26-37 15m 30s\nstart 23,26-47 50 5h12m 30s```"
module.exports.help_text_Stop                           = "```Markdown\nstop\n> Остановить все запущенные тобой лотереи.\nstop ИНДЕКС\n> Остановить определенную запущенную лотерею.```\n**ИНДЕКС** можно узнать командой __show__ или __showlotrun__ в личке. Можно задать несколько индексов через запятую или пробел, или диапазон через тире. Если в лотереи разыгрываются ключи для нескольких игр, то чтобы остановить эту лотерею надо указать **ИНДЕКС** хотя бы одной из разыгрываемых игр.\nКоманда работает только в *общем чате*.\nПримеры:\n```stop 25\nstop 25 36,47\nstop 26-37\nstop 23,26-47 50```"

