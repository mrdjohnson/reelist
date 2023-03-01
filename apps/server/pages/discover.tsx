import { observer } from 'mobx-react-lite'

import React, { useEffect, useState } from 'react'
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles'
import Box from '@mui/material/Box'
import MuiDrawer from '@mui/material/Drawer'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import InboxIcon from '@mui/icons-material/MoveToInbox'
import MailIcon from '@mui/icons-material/Mail'
import {
  Slide,
  SlideProps,
  useScrollTrigger,
  MenuList,
  MenuItem,
  TextField,
  Button,
  Select,
  OutlinedInput,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Chip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material'
import _ from 'lodash'
import { useStore } from '@reelist/utils/hooks/useStore'
import { callTmdb } from '@reelist/apis/api'
import Video from '@reelist/models/Video'

const IMAGE_PATH = 'https://image.tmdb.org/t/p/w500'

const useVideoDiscover = () => {
  const { auth, videoStore } = useStore()

  const videoDiscover = async (params: Record<string, string>) => {
    const searchResults = await Promise.allSettled([
      callTmdb('/discover/tv', params),
      callTmdb('/discover/movie', params),
    ]).then(item => {
      return [
        ...(_.get(item[0], 'value.data.data.results') as Video[] | null),
        ...(_.get(item[1], 'value.data.data.results') as Video[] | null),
      ]
    })

    if (!searchResults) return []

    return searchResults.map(video => {
      return videoStore.makeUiVideo(video)
    })
  }

  return videoDiscover
}

const useAsyncState = <T,>(
  defaultValue: T,
  callback?: () => Promise<T>,
): [T, () => void, boolean] => {
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [value, setValue] = useState(defaultValue)

  const refresh = () => {
    setValue(defaultValue)
    setIsRefreshing(true)
  }

  useEffect(() => {
    if (isRefreshing) {
      callback?.()
        .then(setValue)
        .then(() => setIsRefreshing(false))
    }
  }, [isRefreshing])

  return [value, refresh, isRefreshing]
}

const removeSelectedItem = (
  item: unknown,
  items: unknown[],
  setItems: (items: unknown[]) => void,
) => {
  setItems(_.without(items, item))
}

const MultiSelectBox = ({
  label,
  optionMap,
  values,
  setValue,
  separationType,
  setSeparationType,
}: {
  label: string
  values: string[]
  optionMap: Record<string, { id: string; name: string }>
  setValue: (nextValue: unknown) => void
  separationType?: string
  setSeparationType?: (value: string) => void
}) => {
  const selectId = _.snakeCase(label) + 'label'

  const customRenderValue = (selectedValues: string[]) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {selectedValues.map(selectedValue => (
        <Chip
          key={selectedValue}
          label={optionMap[selectedValue].name}
          variant="outlined"
          onDelete={event => {
            removeSelectedItem(selectedValue, values, setValue)
            event.stopPropagation()
          }}
          onMouseDown={e => e.stopPropagation()}
        />
      ))}
    </Box>
  )

  return (
    <FormControl>
      <InputLabel id={selectId + 'label'}>{label}</InputLabel>

      <Select
        labelId={selectId + 'label'}
        id={selectId}
        label={label}
        value={values}
        onChange={e => setValue(e.target.value as string[])}
        renderValue={customRenderValue}
        sx={{ minWidth: '200px', maxWidth: '600px' }}
        MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
        multiple
      >
        {_.values(optionMap).map(option => (
          <MenuItem value={option.id} key={option.id}>
            <em>{option.name}</em>
          </MenuItem>
        ))}
      </Select>

      {setSeparationType && (
        <RadioGroup
          name="types-radio"
          value={separationType}
          onChange={e => setSeparationType(e.target.value)}
          row
        >
          <FormControlLabel
            value="includes_every"
            control={<Radio />}
            label="Types Include Every"
          />
          <FormControlLabel value="includes_any" control={<Radio />} label="Types Include Any" />
        </RadioGroup>
      )}
    </FormControl>
  )
}

const drawerWidth = 240

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}))

const HideOnScroll = ({ children, direction = 'down' }: SlideProps) => {
  const trigger = useScrollTrigger()

  return (
    <Slide appear={false} direction={direction} in={!trigger}>
      {children}
    </Slide>
  )
}

const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
)

const typeById = {
  '0': { id: '0', name: 'Documentary' },
  '1': { id: '1', name: 'News' },
  '2': { id: '2', name: 'Miniseries' },
  '3': { id: '3', name: 'Reality' },
  '4': { id: '4', name: 'Scripted' },
  '5': { id: '5', name: 'Talk Show' },
  '6': { id: '6', name: 'Video' },
}

const Discover = observer(() => {
  const [open, setOpen] = React.useState(false)
  const [searchErrors, setSearchError] = useState<string>('')
  const videoDiscover = useVideoDiscover()
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedTvGenres, setSelectedTvGenres] = useState<string[]>([])
  const [selectedTvProviders, setSelectedTvProviders] = useState<string[]>([])
  const [tvGenreSeparationType, setTvGenreSeparationType] = useState('includes_every')
  const [typesSeparationType, setTypesSeparationType] = useState('includes_every')
  const [selectedSortBy, setSelectedSortBy] = useState('popularity.desc')

  const [videos, search, loadingVideos] = useAsyncState([], async () => {
    try {
      return await videoDiscover({
        with_type: selectedTypes.join(typesSeparationType === 'includes_any' ? ',' : '|'),
        page: '2',
        sort_by: selectedSortBy,
        watch_region: selectedRegions.join(','),
        with_genres: selectedTvGenres.join(tvGenreSeparationType === 'includes_any' ? ',' : '|'),
        with_providers: selectedTvProviders.join(','),
        // append_to_response: 'images',
      })
    } catch (e) {
      setSearchError(JSON.stringify(e))

      return []
    }
  })

  useEffect(() => {
    search()
  }, [
    selectedRegions,
    selectedTvGenres,
    tvGenreSeparationType,
    typesSeparationType,
    selectedTypes,
    selectedTvProviders,
    selectedSortBy,
  ])

  const [keywords] = useAsyncState([], () =>
    callTmdb('search/keyword').then(item => {
      // debugger
      return _.get(item, 'data.data.results')
    }),
  )

  const [regionById] = useAsyncState({}, () => {
    return callTmdb('/watch/providers/regions')
      .then(
        item =>
          _.get(item, 'data.data.results') as Array<{
            iso31661: string
            englishName: string
            nativeName: string
          }>,
      )
      .then(items => items.map(item => ({ id: item.iso31661, name: item.englishName })))
      .then(items => _.keyBy(items, 'id'))
  })

  const getTvGenres = () => {
    return callTmdb('/genre/tv/list')
      .then(item =>
        _.toArray(
          _.get(item, 'data.data.genres') as Array<{
            id: string
            name: string
          }>,
        ),
      )
      .then(items => _.keyBy(items, 'id'))
  }

  const [tvGenreById] = useAsyncState({}, getTvGenres)

  const getTvProviders = () => {
    return callTmdb('/watch/providers/tv')
      .then(
        item =>
          _.get(item, 'data.data.results') as Array<{
            displayPriority: string
            logoPath: string
            providerName: string
            providerId: string
          }>,
      )
      .then(items => items.map(item => ({ id: item.providerId, name: item.providerName })))
      .then(items => _.keyBy(items, 'id'))
  }

  const [tvProviderById] = useAsyncState({}, getTvProviders)

  const handleToggleDrawer = () => {
    setOpen(!open)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <HideOnScroll>
        <MuiAppBar
          position="fixed"
          sx={{ zIndex: theme => theme.zIndex.drawer + 1, marginLeft: drawerWidth, width: '100%' }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleToggleDrawer}
              edge="start"
              sx={{
                marginRight: 5,
              }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>

            <Typography variant="h6" noWrap component="div">
              Discover by Reelist
            </Typography>
          </Toolbar>
        </MuiAppBar>
      </HideOnScroll>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader />

        <Divider />

        <List>
          {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <MenuList>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <MenuItem key={text} sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </MenuItem>
          ))}
        </MenuList>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />

        <MultiSelectBox
          label="Types"
          optionMap={typeById}
          values={selectedTypes}
          setValue={setSelectedTypes}
          separationType={typesSeparationType}
          setSeparationType={setTypesSeparationType}
        />

        <br />
        <br />

        <FormControl>
          <InputLabel id="sort-by-label">Sort By</InputLabel>

          <Select
            labelId="sort-by-label"
            id="sort-by"
            label="Sort By"
            value={selectedSortBy}
            onChange={e => setSelectedSortBy(e.target.value)}
            sx={{ minWidth: '200px' }}
          >
            <MenuItem value="popularity.desc">
              <em>Popularity (Desc)</em>
            </MenuItem>

            <MenuItem value="popularity.asc">
              <em>Popularity (Asc)</em>
            </MenuItem>

            <MenuItem value="first_air_date.desc">
              <em>First Air Date (Desc)</em>
            </MenuItem>

            <MenuItem value="first_air_date.asc">
              <em>First Air Date (Asc)</em>
            </MenuItem>

            <MenuItem value="vote_average.desc">
              <em>Vote Average (Desc)</em>
            </MenuItem>

            <MenuItem value="vote_average.asc">
              <em>Vote Average (Asc)</em>
            </MenuItem>
          </Select>
        </FormControl>

        <br />
        <br />

        <MultiSelectBox
          label="Regions"
          optionMap={regionById}
          values={selectedRegions}
          setValue={setSelectedRegions}
        />

        <br />
        <br />

        <MultiSelectBox
          label="Tv Genres"
          optionMap={tvGenreById}
          values={selectedTvGenres}
          setValue={setSelectedTvGenres}
          separationType={tvGenreSeparationType}
          setSeparationType={setTvGenreSeparationType}
        />

        <br />
        <br />

        <MultiSelectBox
          label="Tv Providers"
          optionMap={tvProviderById}
          values={selectedTvProviders}
          setValue={setSelectedTvProviders}
        />

        <br />
        <br />

        <ImageList variant="masonry" cols={5}>
          {videos.map((video, index) => {
            const isPosterPath = index % 3 === 0
            const image = isPosterPath ? video.posterPath : video.backdropPath
            return (
              <ImageListItem
                key={video.id}
                cols={isPosterPath ? 1 : 2}
                sx={{
                  transform: 'scale3d(0.98, 0.98, 1)',
                  transition: 'transform 0.15s ease-in-out',
                  '&:hover': { transform: 'scale3d(1, 1, 1)', cursor: 'pointer' },
                }}
              >
                <img src={IMAGE_PATH + image} alt={video.videoName} loading="lazy" />

                {!isPosterPath && <ImageListItemBar title={video.videoName} />}
              </ImageListItem>
            )
          })}
        </ImageList>
      </Box>
    </Box>
  )
})

export default Discover
