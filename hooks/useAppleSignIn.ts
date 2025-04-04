import {
    appleAuth,
    appleAuthAndroid,
} from "@invertase/react-native-apple-authentication";
import uuid from "react-native-uuid";
import metrics from "@/components/design/metrics";
import {TNullable} from "@/hooks/_models";

const { isAndroid } = metrics;

export const useAppleSignIn = (
    onAppleSignIn: (
        appleToken: TNullable<{
            token: string;
            name: string;
            email: string | null;
        }>,
    ) => void,
) => {
    const iosLogin = async () => {
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });

        const credentialState = await appleAuth.getCredentialStateForUser(
            appleAuthRequestResponse.user,
        );

        // use credentialState response to ensure the user is authenticated
        if (credentialState === appleAuth.State.AUTHORIZED) {
            if (
                appleAuthRequestResponse.identityToken === null ||
                appleAuthRequestResponse.fullName === null
            ) {
                onAppleSignIn(null);
            } else {
                console.info(appleAuthRequestResponse);
                onAppleSignIn({
                    token: appleAuthRequestResponse.identityToken,
                    name: `${appleAuthRequestResponse.fullName.givenName || ""} ${
                        appleAuthRequestResponse.fullName.familyName || ""
                    }`,
                    email: appleAuthRequestResponse.email || null,
                });
            }
        }
    };

    const androidLogin = async () => {
        const rawNonce: string = uuid.v4() as string;
        const state: string = uuid.v4() as string;

        appleAuthAndroid.configure({
            // The Service ID you registered with Apple
            clientId: "com.betterstacks.firebase",

            // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
            // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
            redirectUri: "https://stacks-259313.firebaseapp.com/__/auth/handler",

            responseType: appleAuthAndroid.ResponseType.ALL,
            scope: appleAuthAndroid.Scope.ALL,
            nonce: rawNonce,
            state,
        });

        // Open the browser window for user sign in
        const response = await appleAuthAndroid.signIn();

        if (response.id_token === undefined) {
            onAppleSignIn(null);
        } else {
            console.info(response);
            onAppleSignIn({
                token: response.id_token,
                name: `${response.user?.name?.firstName} ${response.user?.name?.lastName}`,
                email: response.user?.email || null,
            });
        }
    };

    const signInWithApple = async () => {
        if (isAndroid) {
            await androidLogin();
        } else {
            await iosLogin();
        }
    };

    return signInWithApple;
};
