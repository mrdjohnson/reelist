
  
    
  
#  Reelist  
This project is backed by [Supabase](https://supabase.com/) and [TMDB](https://www.themoviedb.org/) and made so that users can watch shows together and keep each other up to date with what has been watched, hopefully to help facilitate discussions about episodes as well  
  
  This readme is powered by [https://stackedit.io/app](https://stackedit.io/app)  
  
    
  
**Supabase:** [Supabase cli docs](https://supabase.com/docs/reference/cli/installing-and-updating)  
  
## Getting started  
clone the project, and run `yarn install` in the root directory
**You do not need to run yarn in the `apps/mobile` folder!!**

the project expects a secrets file to exist in the correct location; `yarn nx run server:prep-dev` will ensure that file exists and has some base (useless) values; actual values can be received from project owners (or go create your own) 

### Mobile:
 `cd apps/mobile` and run `yarn start`; this should boot up the react native setup and allow you to run via android or ios

### Website:
the project can be started with `serve development` in the nx console (or `yarn nx serve server --configuration=development` in the terminal)
  
## Available Scripts  
  
This project uses [NX](https://nx.dev/) to handle building and bundling. Using the Visual Studio Code plugin is the best way to interact with this codebase  
  
## Creating a new Library  
Creating a new library "examples" can be done by running  
`nx generate library examples --appProject=apps/mobile --importPath=@reelist/examples --directory=libs`   
## Import aliases  
  
###  Mobile:  
  
Imports like `import Example from '@features/Example'` are handled by [craco](https://www.npmjs.com/package/@craco/craco).  
  
adding new aliases like `~features` can be done via the `/apps/mobile/.babelrc` and `/apps/mobile/tsconfig.json` files.  
because mobile handles its own version of `~/*`, we need to copy the custom import paths used in the `tsconfig.base.json` into our `tsconfig.app.json`  
  
Currently; this maps directly to any directory in the `src` directory: Example: `/apps/mobile/src/feature/FeatureExample` would be mapped to `~/feature/FeatureExample`  
  
### Libraries:   
Each library should have its own import alias: `libs/apis` should be `@reelist/apis`, this allows all the projects (including the libraries) to follow the same import structure   
  
  ## Misc  
  
- Google play store feature graphic generated using: http://tools.neko2me.net/efgg/  
  
## Building the project  
  
### Android:  
  
Previous: builds could be started through the nx console, or manually running `nx run mobile:build-android` (with the optional `--apk` flag)  
  
Current: Due to some forced hermes issues, this command can only be run manually from `/reelist`: `ENTRY_FILE="../../src/main.tsx" nx run mobile:build-android`   
Build output locations are    
- apk: `apps/mobile/android/app/build/outputs/apk/release`  
- aab: `apps/mobile/android/app/build/outputs/bundle/release`  
  
  
