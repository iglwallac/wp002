
/**
 * What do we need to solve ?
 * A normalized object for
 * 1. Activity
 * 2. Reaction
 * 3. Notification ?
 *
 * Notifications Shape:
 *
 *  activities: [{
 *    actor: {}
 *    foreign_id: "reaction:c535aed0-46cf-454a-9b4c-00378082095d"
 *    gaia: {
 *      reactionURL: '',
 *      activityURL: '',
 *      relativeActivityURL: '',
 *      relativeReactionURL: '',
 * }
 *    id: "4dc481b0-6d9d-11eb-8080-800032def702"
 *    object: {}
 *    origin: null
 *    reaction: ''
 *    target: ""
 *    time: "2021-02-13T01:46:34.694904"
 *    verb: "like"
 *  }]
 *  activity_count: 1
 *  actor_count: 1
 *  created_at: "2021-02-13T01:46:34.708610"
 *  group: "like_2021-02-13"
 *  id: "4dc69915-6d9d-11eb-8080-800124a1b5d1.like_2021-02-13"
 *  is_read: true
 *  is_seen: true
 *  updated_at: "2021-02-13T01:46:34.708610"
 *  verb: "like"
 *
 *
 * AFTER LOOKING AT THE NOTIFICATION SHAPE,
 * IT DOES NOT LOOK LIKE IT FITS INTO OUR MODEL.
 * WE MAY NEED A DIFFERENT OBJECT FOR NOTIFICATIONS.
 */

/**
 * Activity class
 *
 * should:
 *  1. Setting properties should be Immutable so that storing in redux
 *    triggers state changes
 *  2. Create an update/mutate() method to do bulk mutations at once.
 *  3. transform the data to a Getstream shape depending on the 'type'
 *
 * USE:
 *  const activity = new Activity(fields)
 *
 *  if (Activity.isPost(activity)) {
 *    //...
 *  }
 *
 *  if (Activity.isComment(activity)) {
 *    //...
 *  }
 *
 *  activity.setText('some text')
 *  activity.setImages(images[])
 *  activity.addImages(images[])
 *  activity.mergeImages(images[])
 *  activity.setGraphs(graphs[])
 *  activity.addGraphs(graphs[])
 *  activity.mergeGraphs(graphs[])
 *  activity.update((activity) => {
 *  activity.mergeImages(images[])
 *    activity.setText('text')
 *  })
 *  activity.toStreamShape()
 */
export default class Activity {
  // Shared Props
  // the uuid for the activity
  id = undefined
  // the type of activity - post, comment, like, etc.
  type = undefined
  // this will be an object to store the text, images, open graphs, etc.
  // making it scalable for more future data we decide to add.
  data = undefined
  // the foreign id for joining gaia data from our own db
  foreignId = undefined
  // feeds the activity/reaction belong to
  targetFeeds = undefined
  // activity has a 'time' but reactions do not.
  // reactions have a 'createdAt'. We can merge these fields and
  // only have a 'createdAt' field
  time = undefined // <--- remove in favor of 'createdAt' ?
  // the date the activity was created
  createdAt = undefined
  // the date the activity was updated
  updatedAt = undefined
  // null for activities like posts, where they are at the top-level
  // will be the activityId for reactions
  parent = undefined
  // will be the feedId for activities
  // will be the activityId for reactions
  // object with id and type
  root = undefined
  // the userId (or actorId) who created the activity/reaction
  // object with id and type and group
  userId = undefined
  // the user (or actor) who created the activity/reaction
  user = undefined
  // this is the same as 'user' but activities user 'user'
  // and reactions use 'actor.' Seems like we can merge these and just use 'user'
  actor = undefined // <--- remove in favor of 'user' ?
  // object holding the latest reactions to an activity.
  // for reactions, this property is called 'latestChildren' but
  // I think we can use the latestReactions instead since 'children' can never
  // be anything other than a reaction.
  latestReactions = undefined
  // object holding extra data for a reaction
  latestReactionsExtra = undefined
  // reactions the actor/user created on their own activity
  ownReactions = undefined
  // counts by reaction type (comment, like, etc)
  reactionCounts = undefined
}

Object.defineProperty(Activity, 'TYPES', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: {
    COMMENT: 'COMMENT',
    POST: 'POST',
    LIKE: 'LIKE',
  },
})

Object.defineProperty(Activity, 'isComment', {
  value: o => (o && o.type === Activity.TYPES.COMMENT) || false,
  configurable: false,
  enumerable: false,
  writable: false,
})

Object.defineProperty(Activity, 'isPost', {
  value: o => (o && o.type === Activity.TYPES.POST) || false,
  configurable: false,
  enumerable: false,
  writable: false,
})

Object.defineProperty(Activity, 'isLike', {
  value: o => (o && o.type === Activity.TYPES.LIKE) || false,
  configurable: false,
  enumerable: false,
  writable: false,
})
