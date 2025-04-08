import {useEffect} from "react";
import {getValueFromStorage} from "@/utils/storage/getStorage";
import {router} from "expo-router";

const TokenCheck = () => {
	useEffect(() => {
		const checkForToken = async () => {
			const token = await getValueFromStorage("token");
			if (token) {
				router.replace("/dashboard");
			}
		};

		checkForToken();
	}, []);

	return null;
};

export default TokenCheck;