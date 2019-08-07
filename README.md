# React CMS 

## Запуск

```
npm i && npm run run
```

## Деплой

```
npm i
npm run build:prod
```

В папке **dist/** появятся все файлы. В папке **/etc** есть конфиг нужный для ***nginx*** (там прокси до бэкенда). Нужно лишь в 
конфиге (при копировании в **/etc/nginx/sites-enabled/**) указать путь до **/dist**.