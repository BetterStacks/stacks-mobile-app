import {ApolloClient, InMemoryCache, HttpLink} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";
import {onError} from "@apollo/client/link/error";
import {setUserToken} from "./store/handlers";
import {getValueFromStorage} from "@/utils/storage/getStorage";
import { ApolloLink, Observable } from "@apollo/client";
import { print } from "graphql";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

// Load detailed error messages in development
if (__DEV__) {
  loadDevMessages();
  loadErrorMessages();
}

// Define types for file objects
interface FileObject {
  uri: string;
  name: string;
  type: string;
}

// Custom fetch function that handles FormData uploads
const customFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  return fetch(input, init);
};

// Custom upload link to replace apollo-upload-client
const createCustomUploadLink = () => {
  return new ApolloLink(operation => {
    const { variables } = operation;
    const context = operation.getContext();
    const { hasUpload = false } = context;

    // If context has hasUpload flag, use FormData for file uploads
    if (hasUpload) {
      return new Observable(observer => {
        try {
          console.log("Upload operation:", operation.operationName);
          console.log("Original variables:", JSON.stringify(variables, null, 2));
          
          // Create FormData instance
          const formData = new FormData();
          
          // Extract files from variables to handle them separately
          const files = variables.files || [];
          
          // Create a copy of variables without the file objects
          const variablesCopy = { ...variables };
          
          // Replace files array with null references
          variablesCopy.files = files.map(() => null);
          
          // Create the operations object
          const operations = {
            query: print(operation.query),
            variables: variablesCopy
          };
          
          console.log("Operations:", JSON.stringify(operations, null, 2));
          formData.append('operations', JSON.stringify(operations));
          
          // Create the map for files
          const fileMap: Record<string, string[]> = {};
          if (files.length > 0) {
            files.forEach((_: any, i: number) => {
              fileMap[i.toString()] = [`variables.files.${i}`];
            });
            
            console.log("Map:", JSON.stringify(fileMap, null, 2));
            formData.append('map', JSON.stringify(fileMap));
            
            // Append each file with the correct format for React Native
            files.forEach((file: FileObject, i: number) => {
              console.log(`Adding file ${i} to FormData:`, file.name, file.type);
              
              // Create a file object that React Native fetch API can process correctly
              const fileObject = {
                uri: file.uri,
                name: file.name,
                type: file.type || 'application/octet-stream'
              };
              
              // In React Native, we need to cast this as any since the FormData type
              // definition doesn't match the actual runtime behavior for file uploads
              formData.append(i.toString(), fileObject as unknown as Blob);
            });
          }
          
          // Get the auth token from context headers
          const token = context.headers?.["X-Authorization"] || "";
          
          console.log("Sending upload request to server with token:", token ? "token exists" : "no token");
          
          // Send the request with the proper headers
          fetch("https://api.betterstacks.com/graphql", {
            method: 'POST',
            headers: {
              "X-Authorization": token,
              // Let fetch API set the proper content-type with boundary
            },
            body: formData,
          })
            .then(response => {
              console.log("Upload response status:", response.status);
              console.log("Response headers:", JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
              
              // Get the response text for debugging, since we might have a 500 error
              return response.text().then(text => {
                console.log("Raw response:", text);
                try {
                  // Try to parse it as JSON if possible
                  return { ok: response.ok, status: response.status, data: JSON.parse(text) };
                } catch (e) {
                  // If it's not JSON, return the raw text
                  return { ok: response.ok, status: response.status, text };
                }
              });
            })
            .then(result => {
              if (!result.ok) {
                throw new Error(`Network response was not ok: ${result.status}, ${result.text || JSON.stringify(result.data)}`);
              }
              
              // If we have data, process it
              if (result.data) {
                if (result.data.errors) {
                  console.error("GraphQL Errors:", JSON.stringify(result.data.errors, null, 2));
                }
                observer.next(result.data);
                observer.complete();
              } else {
                throw new Error("Invalid response format");
              }
            })
            .catch(error => {
              console.error("Upload error:", error);
              observer.error(error);
            });
        } catch (err) {
          console.error("Error in custom upload link:", err);
          observer.error(err);
        }
      });
    }
    
    // Default HTTP link behavior for non-upload operations
    return new HttpLink({
      uri: "https://api.betterstacks.com/graphql",
      fetch: customFetch,
    }).request(operation);
  });
};

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

const httpLink = new HttpLink({
  uri: "https://api.betterstacks.com/graphql",
  fetch: customFetch,
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

const customUploadLink = createCustomUploadLink();
const authFlowLink = setAuthorizationHeader.concat(resetToken);

const client = new ApolloClient({
  link: authFlowLink.concat(customUploadLink),
  cache: new InMemoryCache(),
});

export default client;
