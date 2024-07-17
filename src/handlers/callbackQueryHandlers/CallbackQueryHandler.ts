async function callbackHandler(){
    const
      id = callback_query.message.chat.id.toString(),
      messageId = callback_query.message.message_id,
      queryId = callback_query.id,
      [botCommand, data] = callback_query.data.split('/');
    
    const user = allUsers.getData(id)
    console.log('Пользователь:', user.name, 'id', id, 'комманда:', botCommand)
    
    try{
      switch (botCommand){
        case 'cancelAwait': return delete user.cancelAwait;
        case 'acceptOrder': return mods.acceptOrder({id, user, bot, botCommand, messageId, queryId, data, callback_query})
      }
    
      switch (user.program){  
        case 'selectPoints':
          return await mods.SelectPoints({id, user, bot, botCommand, messageId, queryId});
        
        case 'showArchive':
          return showArchive(now)
        
        case 'presets':
          if (callback_query) await mods.Presets({id, callback_query, user, bot, botCommand, messageId, queryId})
          return 
      }
    } catch (e) {
      console.error(e, 'CallbackHandlerError ' + user?.id ?? '')
    } finally {
      console.log('Saving userdata')
      user?.save()
    }
  }