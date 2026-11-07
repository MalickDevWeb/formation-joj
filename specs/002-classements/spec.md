# 002 — Publier le classement d'une épreuve terminée

**Statut** : Implémentée
**PRD** : specs/prd-resultats.md, TR2

## Contexte

Les journalistes recoupent les classements à la main, et rien ne garantit qu'un classement publié soit cohérent. Une fois une épreuve terminée, le responsable résultats doit pouvoir publier son classement complet, d'où se déduisent seules les médailles, sans qu'un classement incohérent puisse sortir.

## User stories

- En tant que responsable résultats d'un site, je veux publier le classement complet d'une épreuve terminée, afin qu'il fasse foi.
- En tant que journaliste, je veux voir pour chaque rang l'athlète, son pays, sa performance et sa médaille, afin de citer un podium sûr.

## Scénarios d'acceptation

### AS1 — Publier le classement de cinq athlètes

- **Étant donné** l'épreuve « 100 m garçons — finale », terminée, sans classement
- **Quand** le responsable publie cinq lignes, rangs 1 à 5, chacune avec un athlète, son pays et sa performance
- **Alors** le classement publié contient les cinq lignes dans l'ordre des rangs ; le rang 1 a l'or, le rang 2 l'argent, le rang 3 le bronze, les rangs 4 et 5 aucune médaille

### AS2 — Refuser le classement d'une épreuve qui n'est pas terminée

- **Étant donné** une épreuve à venir ou en cours
- **Quand** le responsable publie son classement
- **Alors** c'est refusé, avec un message qui dit que l'épreuve n'est pas terminée, et l'épreuve n'a toujours pas de classement

### AS3 — Refuser des rangs qui ne se suivent pas

- **Étant donné** une épreuve terminée
- **Quand** le responsable publie des rangs qui ne commencent pas à 1, ou qui ont un trou (1, 2, 4) ou un doublon (1, 2, 2)
- **Alors** c'est refusé, avec un message qui dit que les rangs doivent se suivre à partir de 1

### AS4 — Refuser un athlète présent deux fois

- **Étant donné** une épreuve terminée
- **Quand** le responsable publie un classement où le même athlète du même pays apparaît sur deux lignes
- **Alors** c'est refusé, avec un message qui nomme l'athlète en double

### AS5 — Refuser une seconde publication

- **Étant donné** une épreuve terminée dont le classement est déjà publié
- **Quand** le responsable publie un autre classement
- **Alors** c'est refusé, avec un message de conflit, et le premier classement reste inchangé

## Hors périmètre

- Consulter une épreuve et son classement, l'écran public (TR3) ; le tableau des médailles (TR4).
- Rectifier un classement publié (TR5), les ex æquo.

## Questions ouvertes

- Hypothèse : un athlète est identifié par son nom et son pays ; deux homonymes de pays différents sont deux athlètes.
- Hypothèse : le pays est un code de trois lettres (SEN, MAR…) et la performance un texte libre non vide.
- Hypothèse : un classement a au moins une ligne ; avec moins de trois lignes, il y a moins de trois médailles.
- Hypothèse : la seconde publication est refusée, car remplacer un classement sans trace est le problème du PRD ; la correction viendra avec TR5.
