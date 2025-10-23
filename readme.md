# Для проверки

Создать .env (example.env)
Создать credentials/google-service-account.json (google-service-account.example.json)
Вставить данные своей таблицы 

Запустить команды:
> docker compose down --rmi local --volumes
> docker compose up --build

# Полезные ссылки:
// https://docs.google.com/document/u/0/d/e/2PACX-1vTYfLgip1G1-GmLsU7T3RCmT52eoR1ZPOaSBkNWPCA0Db534AhNFm32lplolcTZGdHufBAjz_TrOrdZ/pub?pli=1
// https://dev.wildberries.ru/openapi/api-information#tag/Vvedenie/Podderzhka
// https://github.com/lucard17/btlz-wb-test
// https://console.cloud.google.com/iam-admin/serviceaccounts/details/117012667017541279854/keys?project=btlz-wb-test-475901
// https://docs.google.com/spreadsheets/d/1gByvYsnZZ690vDAWsXpGdnvav4n2z7or01AKfjGV2Ro/edit?gid=0#gid=0


# Шаблон для выполнения тестового задания

## Описание
Шаблон подготовлен для того, чтобы попробовать сократить трудоемкость выполнения тестового задания.

В шаблоне настоены контейнеры для `postgres` и приложения на `nodejs`.  
Для взаимодействия с БД используется `knex.js`.  
В контейнере `app` используется `build` для приложения на `ts`, но можно использовать и `js`.

Шаблон не является обязательным!\
Можно использовать как есть или изменять на свой вкус.

Все настройки можно найти в файлах:
- compose.yaml
- dockerfile
- package.json
- tsconfig.json
- src/config/env/env.ts
- src/config/knex/knexfile.ts

## Команды:

Запуск базы данных:
```bash
docker compose up -d --build postgres
```

Для выполнения миграций и сидов не из контейнера:
```bash
npm run knex:dev migrate latest
```

```bash
npm run knex:dev seed run
```
Также можно использовать и остальные команды (`migrate make <name>`,`migrate up`, `migrate down` и т.д.)

Для запуска приложения в режиме разработки:
```bash
npm run dev
```

Запуск проверки самого приложения:
```bash
docker compose up -d --build app
```

Для финальной проверки рекомендую:
```bash
docker compose down --rmi local --volumes
docker compose up --build
```

PS: С наилучшими пожеланиями!
