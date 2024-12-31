import {redirect} from "next/navigation";

function Page(props: any) {
     const {key, path} = props.params;

	redirect(`/api/template-proxy?key=${encodeURIComponent(key)}&path=${encodeURIComponent(path.join("/"))}`);

	return null;
}

export default Page;
