import { HOME_ROUTE } from "@/constants/app.route.const"

function UserNotExist() {
    return new Response(JSON.stringify({ message: "L'utilisateur n'existe pas !", redirect: HOME_ROUTE, valid: false }), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 400
    })
}

export {
    UserNotExist
}

