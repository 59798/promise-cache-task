// Dependencies
import Bluebird from 'bluebird'

import express from 'express'
import fsOrigin from 'fs'
import marked from 'marked'

// Module enhancement
const fs= Bluebird.promisifyAll(fsOrigin)
const markedAsync= Bluebird.promisify(marked)

// Public
export default (cwd)=>{
  const router= express.Router()

  router.use((req,res,next)=>{
    let filePath= req.url.slice(1)
    if(filePath==='' || filePath.match(/\/$/)){
      filePath+= 'index'
    }
    const fileName= `${cwd}/${filePath}.md`
    const cacheName= `${cwd}/${filePath}.html`

    const notFound= fs.existsSync(fileName)===false
    const useCache= fs.existsSync(cacheName)
    if(notFound){
      return next()
    }
    if(useCache){
      return res.sendFile(cacheName)
    }

    fs.readFileAsync(fileName)
    .then((data)=>(
      markedAsync(data.toString())
    ))
    .then((cache)=>{
      cache= cache.trim()// 末尾"\n"の削除
      
      return fs.writeFileAsync(cacheName,cache)
      .then((result)=>{
        res.set('content-type','text/html')
        res.end(cache)
      })
    })
  })

  return router
}