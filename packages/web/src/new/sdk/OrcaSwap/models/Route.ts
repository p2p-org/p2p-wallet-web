export type Route = string[];
export type Routes = Record<string, Route[]>;

//    "FTT/RAY": [
//            [
//                "FTT/SOL",
//                "RAY/SOL"
//            ],
//            [
//                "FTT/SOL",
//                "RAY/SOL[aquafarm]"
//            ],
//            [
//                "FTT/SOL[aquafarm]",
//                "RAY/SOL"
//            ],
//            [
//                "FTT/SOL[aquafarm]",
//                "RAY/SOL[aquafarm]"
//            ]
//        ]
