# API de gestion de bibliotheque

API Node.js + Express + MongoDB pour gerer des utilisateurs, des livres et des droits d'acces avec authentification JWT.

## Objectif du projet

Cette API permet de:
- creer un compte utilisateur
- se connecter avec un token JWT
- consulter les livres publiquement
- creer, modifier et supprimer des livres avec controle de proprietaire
- limiter la suppression aux proprietaires et aux administrateurs
- renvoyer uniquement des reponses JSON

## Fonctionnalites principales

- Authentification avec `register`, `login` et `me`
- CRUD des livres
- Protection des routes privees avec `Bearer token`
- Validation des donnees avec `express-validator`
- Mot de passe chiffre avec `bcryptjs`
- Reponses standardisees avec `success`, `message` et `data`
- Erreurs JSON propres avec les statuts `401`, `403`, `404`, `409` et `500`

## Stack technique

- Node.js
- Express
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- express-validator
- dotenv

## Organisation du projet

- `server.js` : point de demarrage du serveur et connexion a MongoDB
- `src/app.js` : configuration Express, routes, 404 et gestion des erreurs
- `src/config/db.js` : connexion a la base MongoDB
- `src/models/User.js` : modele utilisateur
- `src/models/Book.js` : modele livre
- `src/controllers/authController.js` : logique d'inscription, connexion et profil
- `src/controllers/bookController.js` : logique des livres
- `src/routes/authRoutes.js` : routes d'authentification
- `src/routes/bookRoutes.js` : routes des livres
- `src/middlewares/authMiddleware.js` : protection JWT et roles
- `src/middlewares/errorMiddleware.js` : gestion des erreurs et route inconnue
- `src/validators/authValidators.js` : validation des donnees d'authentification
- `src/validators/bookValidators.js` : validation des donnees des livres

## Prerequis

Avant de lancer le projet, il faut:
- Node.js installe
- npm installe
- soit MongoDB en local, soit une base MongoDB Atlas
- un client API comme Postman, Insomnia ou Thunder Client pour tester les routes privees

## Installation

1. Cloner le projet puis ouvrir le dossier du projet.
2. Installer les dependances:

```bash
npm install
```

3. Creer un fichier `.env` a la racine du projet.

## Configuration du fichier `.env`

Exemple de configuration locale:

```env
PORT=3050
MONGODB_URI=mongodb://127.0.0.1:27017/leclerc_library
JWT_SECRET=une_longue_chaine_aleatoire
JWT_EXPIRES_IN=1d
```

### Explication des variables

- `PORT` : port du serveur Express
- `MONGODB_URI` : adresse de connexion a MongoDB
- `JWT_SECRET` : cle secrete utilisee pour signer les tokens
- `JWT_EXPIRES_IN` : duree de validite du token, ici `1d` pour 24 heures

### Avec MongoDB Atlas

Si tu utilises MongoDB Atlas, remplace `MONGODB_URI` par la chaine fournie par Atlas.

## Demarrage du serveur

Lancer le serveur en mode development:

```bash
npm run dev
```

Lancer le serveur en mode normal:

```bash
npm start
```

Si tout est bon, le terminal doit afficher la connexion a MongoDB puis le demarrage du serveur sur `http://localhost:3050`.

## Base de donnees

- En local, MongoDB doit etre installe et demarre.
- La base `leclerc_library` peut etre creee automatiquement au premier enregistrement.
- Si l'application est deployee en ligne, la base doit deja etre accessible via `MONGODB_URI`.
- Aucun dossier ou base manuelle supplementaire n'est necessaire pour un premier test local, si MongoDB tourne deja.

## Tests rapides dans le navigateur

Les routes publiques peuvent etre testees directement dans un navigateur:

- `GET http://localhost:3050/`
- `GET http://localhost:3050/api/books`
- `GET http://localhost:3050/api/books/:id`

Ces routes ne demandent pas de token.

## Tests complets avec Postman

Les routes qui modifient les donnees ou qui sont protegees doivent etre testees dans Postman ou un outil equivalent.

### 1. Creer un utilisateur

`POST http://localhost:3050/api/auth/register`

Body JSON:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test12345"
}
```

Reponse attendue:
- `201 Created`
- un `token`
- un objet `user`
- jamais de `password`

### 2. Se connecter

`POST http://localhost:3050/api/auth/login`

Body JSON:

```json
{
  "email": "test@example.com",
  "password": "test12345"
}
```

Reponse attendue:
- `200 OK`
- un `token`
- les infos de l'utilisateur

### 3. Consulter l'utilisateur connecte

`GET http://localhost:3050/api/auth/me`

Dans Postman:
- onglet `Authorization`
- type `Bearer Token`
- coller le token recu au login

Reponse attendue:
- `200 OK`
- les donnees de l'utilisateur courant
- jamais de `password`

### 4. Creer un livre

`POST http://localhost:3050/api/books`

Headers:
- `Authorization: Bearer <token>`

Body JSON:

```json
{
  "title": "Clean Code",
  "author": "DOSSOU Albert",
  "isbn": "9780132350884",
  "description": "Bon livre pour apprendre les bonnes pratiques."
}
```

Reponse attendue:
- `201 Created`
- le livre cree
- `owner` ajoute automatiquement par le serveur

### 5. Modifier un livre

`PUT http://localhost:3050/api/books/:id`

Headers:
- `Authorization: Bearer <token>`

Body JSON:

```json
{
  "title": "Clean Code",
  "author": "DOSSOU Albert"
  "isbn": "9780132350884",
  "description": "Version mise a jour."
}
```

Reponse attendue:
- `200 OK`
- uniquement le proprietaire du livre, ou un admin, peut modifier

### 6. Supprimer un livre

`DELETE http://localhost:3050/api/books/:id`

Headers:
- `Authorization: Bearer <token>`

Reponse attendue:
- `200 OK`
- uniquement le proprietaire du livre, ou un admin, peut supprimer

## Statuts HTTP utiles

- `200` : requete reussie
- `201` : ressource creee avec succes
- `400` : donnees invalides
- `401` : non authentifie ou token invalide
- `403` : acces interdit
- `404` : ressource ou route introuvable
- `409` : conflit, par exemple un email ou un ISBN deja utilise
- `500` : erreur serveur

## Regles de securite

- le mot de passe n'est jamais retourne dans les reponses
- les routes privees demandent un token JWT
- un livre appartient a un proprietaire (`owner`)
- un administrateur peut supprimer un livre meme s'il n'en est pas le proprietaire

## Champs des modeles

### User
- `name`
- `email`
- `password`
- `role`

### Book
- `title`
- `author`
- `isbn`
- `description`
- `owner`
- `createdAt`
- `updatedAt`

## Notes importantes

- `owner` contient l'identifiant de l'utilisateur qui a cree le livre
- `timestamps: true` ajoute automatiquement `createdAt` et `updatedAt`
- `Bearer` dans l'en-tete `Authorization` sert a transmettre le token JWT
- le dossier `validators` n'est pas obligatoire pour que l'API demarre, mais il aide a garder les controles propres

## Depannage

### Le serveur ne demarre pas
- verifier que `.env` existe
- verifier que `MONGODB_URI` est correcte
- verifier que MongoDB est lance si tu utilises une base locale

### Erreur `401`
- verifier que le token est present
- verifier que l'en-tete est de la forme `Authorization: Bearer <token>`

### Erreur `403`
- verifier que l'utilisateur est bien proprietaire du livre, ou admin

### Erreur `404`
- verifier l'URL de la route
- verifier l'`id` du livre

## Rappel pour les tests

1. Demarrer MongoDB si tu travailles en local.
2. Lancer `npm run dev`.
3. Tester `register`.
4. Tester `login`.
5. Tester `me`.
6. Tester `GET /api/books` dans le navigateur.
7. Tester `POST`, `PUT` et `DELETE` dans Postman.


## Checklist de tests rapide

1. `GET http://localhost:3050/`
   - attendu: `200 OK`
   - reponse: serveur en marche

2. `GET http://localhost:3050/api/books`
   - attendu: `200 OK`
   - reponse: liste des livres, souvent vide au debut

3. `POST http://localhost:3050/api/auth/register`
   - body:
     ```json
     {
       "name": "Aicha Houngbedji",
       "email": "aicha.houngbedji@example.com",
       "password": "Test12345"
     }
     ```
   - attendu: `201 Created`
   - reponse: token + user, jamais de `password`

4. `POST http://localhost:3050/api/auth/login`
   - body:
     ```json
     {
       "email": "aicha.houngbedji@example.com",
       "password": "Test12345"
     }
     ```
   - attendu: `200 OK`
   - reponse: token + user

5. `GET http://localhost:3050/api/auth/me`
   - header: `Authorization: Bearer <token>`
   - attendu: `200 OK`
   - reponse: utilisateur courant sans `password`

6. `POST http://localhost:3050/api/books`
   - header: `Authorization: Bearer <token>`
   - body:
     ```json
     {
       "title": "Les bases de Node.js",
       "author": "Ahouansou Serge",
       "isbn": "9780132350884",
       "description": "Livre de test pour l'API bibliotheque."
     }
     ```
   - attendu: `201 Created`
   - reponse: livre cree avec `owner`, `createdAt` et `updatedAt`

7. `PUT http://localhost:3050/api/books/<BOOK_ID>`
   - header: `Authorization: Bearer <token>`
   - body:
     ```json
     {
       "title": "Les bases de Node.js",
       "author": "Ahouansou Serge",
       "isbn": "9780132350884",
       "description": "Version mise a jour."
     }
     ```
   - attendu: `200 OK`

8. `DELETE http://localhost:3050/api/books/<BOOK_ID>`
   - header: `Authorization: Bearer <token>`
   - attendu: `200 OK`

9. `GET http://localhost:3050/api/rien-ici`
   - attendu: `404 Not Found`
   - reponse: `Route introuvable`

## Vider la base de donnees

Si tu veux recommencer a zero en local, voici deux options.

### Option 1: supprimer toute la base

```powershell
node -e "require('dotenv').config({ path: '.env' }); const mongoose = require('mongoose'); (async () => { await mongoose.connect(process.env.MONGODB_URI); await mongoose.connection.db.dropDatabase(); console.log('Base videe'); await mongoose.disconnect(); })().catch(err => { console.error(err); process.exit(1); });"
```

### Option 2: vider seulement users et books

```powershell
node -e "require('dotenv').config({ path: '.env' }); const mongoose = require('mongoose'); (async () => { await mongoose.connect(process.env.MONGODB_URI); await mongoose.connection.collection('users').deleteMany({}); await mongoose.connection.collection('books').deleteMany({}); console.log('Collections users et books videes'); await mongoose.disconnect(); })().catch(err => { console.error(err); process.exit(1); });"
```

Cette partie ne concerne que les tests locaux. En production, il ne faut pas l'utiliser sans precaution.
