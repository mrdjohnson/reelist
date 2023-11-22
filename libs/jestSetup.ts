import axios from 'axios'
// @ts-ignore
import httpAdapter from 'axios/lib/adapters/http'

axios.defaults.adapter = httpAdapter
