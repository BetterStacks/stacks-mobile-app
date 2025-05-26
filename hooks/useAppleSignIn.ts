import {appleAuth, appleAuthAndroid,} from "@invertase/react-native-apple-authentication";
import uuid from "react-native-uuid";
import metrics from "@/components/design/metrics";
import {TNullable} from "@/hooks/_models";

const { isAndroid, isIOS } = metrics;

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
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
            });

            const credentialState = await appleAuth.getCredentialStateForUser(
                appleAuthRequestResponse.user,
            );

        // use credentialState response to ensure the user is authenticated
        if (credentialState === appleAuth.State.AUTHORIZED) {
            if (appleAuthRequestResponse.identityToken === null) {
                onAppleSignIn(null);
            } else {
                console.info("Apple Auth Response:", appleAuthRequestResponse);
                
                // Extract name, handling cases where fullName might be null
                let fullName = "Apple User";
                if (appleAuthRequestResponse.fullName) {
                    const givenName = appleAuthRequestResponse.fullName.givenName || "";
                    const familyName = appleAuthRequestResponse.fullName.familyName || "";
                    fullName = `${givenName} ${familyName}`.trim() || "Apple User";
                }
                
                onAppleSignIn({
                    token: appleAuthRequestResponse.identityToken,
                    name: fullName,
                    email: appleAuthRequestResponse.email || null,
                });
            }
        } else {
            console.log("Apple Auth not authorized, state:", credentialState);
            onAppleSignIn(null);
        }
        } catch (error) {
            console.error("Apple Sign-In iOS error:", error);
            onAppleSignIn(null);
        }
    };

    const androidLogin = async () => {
        try {
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
            console.info("Apple Android Response:", response);
            
            // Extract name, handling cases where name might be null
            let fullName = "Apple User";
            if (response.user?.name) {
                const firstName = response.user.name.firstName || "";
                const lastName = response.user.name.lastName || "";
                fullName = `${firstName} ${lastName}`.trim() || "Apple User";
            }
            
            onAppleSignIn({
                token: response.id_token,
                name: fullName,
                email: response.user?.email || null,
            });
        }
        } catch (error) {
            console.error("Apple Sign-In Android error:", error);
            onAppleSignIn(null);
        }
    };

    const signInWithApple = async () => {
        try {
            console.log("Apple Sign-In starting, platform detection:", { isAndroid, isIOS });
            console.log("Metrics object:", metrics);
            
            if (isAndroid) {
                console.log("Using Android Apple Sign-In flow");
                await androidLogin();
            } else {
                console.log("Using iOS Apple Sign-In flow");
                await iosLogin();
            }
        } catch (error) {
            console.error("Apple Sign-In general error:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            onAppleSignIn(null);
        }
    };

    return signInWithApple;
};
