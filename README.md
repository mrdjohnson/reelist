
  

#  Reelist
This project is backed by [Supabase](https://supabase.com/) and [TMDB](https://www.themoviedb.org/) and made so that users can watch shows together and keep each other up to date with what has been watched, hopefully to help facilitate discussions about episodes as well

  This readme is powered by [https://stackedit.io/app](https://stackedit.io/app)

  

**Supabase:** [Supabase cli docs](https://supabase.com/docs/reference/cli/installing-and-updating)

  

## Available Scripts

This project uses [NX](https://nx.dev/) to handle building and bundling. Using the Visual Studio Code plugin is the best way to interact with this codebase

## Import aliases

###  Mobile:

Imports like `import Example from '@features/Example'` are handled by [craco](https://www.npmjs.com/package/@craco/craco).

adding new aliases like `~features` can be done via the `/apps/mobile/.babelrc` and `/apps/mobile/tsconfig.json` files.

Currently this maps directly to any directory in the `src` directory: Example: `/apps/mobile/src/feature/FeatureExample`  would be mapped to `~/feature/FeatureExample`

  ## Misc

Google play store feature graphic generated using: http://tools.neko2me.net/efgg/