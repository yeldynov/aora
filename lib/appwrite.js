import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from 'react-native-appwrite'

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.yeldynov.aora',
  projectId: '6639b61800173f1f817b',
  databaseId: '6639b74800325fbbe65b',
  userCollectionId: '6639b75f0019d2208e58',
  videoCollectionId: '6639b78800350d5dda77',
  storageId: '6639b99e001098f97b76',
}

// Init your React Native SDK
const client = new Client()

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform)

const account = new Account(client)
const avatars = new Avatars(client)
const databases = new Databases(client)

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    )

    if (!newAccount) throw Error

    const avatarUrl = avatars.getInitials(username)

    await signIn(email, password)

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    )

    return newUser
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

export const signIn = async (email, password) => {
  try {
    // TODO: It's a CRUTCH! Need to handle it out
    // account.deleteSession('current')
    const session = await account.createEmailPasswordSession(email, password)

    return session
  } catch (error) {
    throw new Error(error)
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get()

    if (!currentAccount) throw Error

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if (!currentUser) throw Error

    return currentUser.documents[0]
  } catch (error) {
    console.log(error)
  }
}
