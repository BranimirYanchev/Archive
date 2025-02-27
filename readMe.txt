Alma-Chronicles - Инструкции за стартиране на проекта

## 1. Инсталация на XAMPP (Frontend)
XAMPP/MAMP е необходим за стартиране на phpMyAdmin, който се използва за управление на MySQL базата данни, както и за осигуряване на среда за JavaScript HTTP заявки.

### **Стъпки за инсталация (Windows):**
1. Изтеглете XAMPP от официалния сайт: [https://www.apachefriends.org](https://www.apachefriends.org).
2. Инсталирайте XAMPP, като изберете Apache, MySQL и PHP.
3. Стартирайте XAMPP Control Panel и активирайте Apache и MySQL.

### **Стъпки за инсталация (macOS):**
1. Изтеглете MAMP от официалния сайт: [https://www.mamp.info](https://www.mamp.info) (XAMPP за macOS е по-ограничен, MAMP е по-добър избор).
2. Инсталирайте MAMP и се уверете, че Apache и MySQL са активирани.
3. Стартирайте MAMP и достъпете phpMyAdmin чрез: [http://localhost/phpMyAdmin/](http://localhost/phpMyAdmin/).

### **Важно:**
Премахнете всички файлове от папката `htdocs` в XAMPP и поставете разархивираната папка на проекта в нея.

## 2. Инсталиране на .NET (Backend)
Backend частта на проекта използва ASP.NET Core Web API. За да го стартирате, трябва да инсталирате .NET SDK (версия 7.0 или по-нова).

### **Стъпки за инсталация:**
1. Изтеглете и инсталирайте .NET SDK от официалния сайт: [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download).
2. Проверете дали инсталацията е успешна, като изпълните в терминала:
   ```sh
   dotnet --version
   ```
3. Отворете терминала, навигирайте до папката `/backend/Web_API` и изпълнете:
   ```sh
   dotnet run
   ```
   Това ще стартира Web API сървъра.

## 3. phpMyAdmin и вкарване на базата (Database)
Базата данни трябва да бъде създадена и импортирана в MySQL чрез phpMyAdmin.

### **Стъпки за настройка:**
1. Отворете phpMyAdmin, като в браузъра въведете: [http://localhost:8888/phpmyadmin/](http://localhost:8888/phpmyadmin/).
2. Създайте нов потребител:
   - Отидете в **User accounts**.
   - Кликнете върху **Add user account**.
   - В полето **User name** въведете: `admin`.
   - В полето **Password** въведете: `admin1234` и го потвърдете.
   - В секцията **Global privileges** маркирайте **ALL PRIVILEGES**.
   - Натиснете **Go**, за да създадете потребителя.

### **Данни за вход:**
- **User:** `admin`
- **Password:** `admin1234`

### **Създаване на база данни:**
1. В phpMyAdmin отворете **Databases** от главното меню.
2. В полето **Database name** въведете: `archive-db`.
3. Уверете се, че типът на базата е **utf8_general_ci**.
4. Натиснете **Create**, за да завършите процеса.
5. Отидете в раздел **Import** и качете SQL файла с базата данни, който се намира в:
   ```
   /database-sql/archive-db.sql
   ```
6. Уверете се, че базата е коректно импортирана.

## 4. Конфигурация на връзката с базата в ASP.NET Core
Файлът за конфигурация (`/backend/Web_API/Database.cs`) трябва да съдържа следния connection string:
```csharp
string myConnectionString = "server=127.0.0.1;port=8889;user=admin;password=admin1234;database=archive-db;";
```
Ако портът е различен, коригирайте го спрямо вашата MySQL инсталация.

## 5. Стартиране на frontend частта

1. Уверете се, че сте премахнали всички файлове от папката `htdocs` в XAMPP.
2. Поставете разархивираната папка на проекта в `htdocs`.
3. Стартирайте Apache чрез XAMPP Control Panel.
4. Отворете браузър и въведете:
   ```
   http://localhost
   ```
   Това ще зареди уеб приложението.

## 6. Какво да очаквате след стартирането?
- **Frontend:** Въведете `http://localhost` в браузъра, за да заредите уеб приложението.
- **Backend:** Ако Web API-то работи правилно, трябва да имате достъп до него на `http://localhost:<порт>/api/`.
- **Database:** Уверете се, че данните са налични в MySQL чрез phpMyAdmin.

## 7. Как да го изпробвате?
За удобство са предоставени три тестови акаунта, които могат да се използват за достъп до различните ролеви нива в приложението. 

### **Достъпни ролеви акаунти:**
#### **Ученик:**
- **Email:** student@mail.com  
- **Парола:** Student1234  

#### **Родител:**
- **Email:** parent@mail.com  
- **Парола:** Parent1234  

#### **Учител:**
- **Email:** teacher@mail.com  
- **Парола:** Teacher1234  

### **Заключение**
След като изпълните тези стъпки, проектът трябва да работи успешно! 🚀

