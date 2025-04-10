import {ApolloClient, InMemoryCache} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";
import {onError} from "@apollo/client/link/error";
import {setUserToken} from "./store/handlers";
import {getValueFromStorage} from "@/utils/storage/getStorage";
import {createUploadLink} from "apollo-upload-client";

const resetToken = onError(({ networkError }) => {
  if (
    networkError &&
    networkError.name === "ServerError" && // @ts-ignore
    networkError.statusCode === 401
  ) {
    // remove cached token on 401 from the server
    setUserToken("");
  }
});

const httpLink = createUploadLink({
  uri: "https://api.betterstacks.com" + "/graphql",
});

const setAuthorizationHeader = setContext(async (_, { headers }) => {
  // const token = userTokenVar();
  const token = await getValueFromStorage("token");

  return {
    headers: {
      ...headers,
      "X-Authorization": token ? `${token}` : "",
    },
  };
});

const authFlowLink = setAuthorizationHeader.concat(resetToken).concat(httpLink);

const client = new ApolloClient({
  link: authFlowLink.concat(createUploadLink()),
  cache: new InMemoryCache(),
});


export default client;
