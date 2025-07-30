// List of common Vietnamese toxic words (expand as needed)
const toxicWords = [
  // Original
  "địt", "cặc", "lồn", "đụ", "chó", "ngu", "đéo", "vãi", "fuck", "shit", "bitch", "dcm", "dm", "cc", "ml",
  "đĩ", "bố mày", "bà mày", "mẹ mày", "bố nhà mày", "bà nhà mày", "mẹ nhà mày", "bố đời", "bà đời", "mẹ đời",
  "khốn nạn", "khốn kiếp", "rác rưởi", "bẩn thỉu", "bựa", "bựa vãi", "bựa quá", "bựa thật", "bựa vl",
  "vkl", "vcl", "vcc", "vđ", "vãi l", "vãi c", "vãi đái", "vãi hàng", "vãi chưởng", "vãi cả lồn", "vãi cả c",
  "óc chó", "óc lợn", "óc heo", "não phẳng", "não tàn", "não cá vàng", "não ngắn", "não chó", "não bò",
  "thằng ngu", "con ngu", "thằng chó", "con chó", "thằng điên", "con điên", "thằng khùng", "con khùng",
  "thằng rồ", "con rồ", "thằng dở", "con dở", "thằng dở hơi", "con dở hơi", "thằng thần kinh", "con thần kinh",
  "mẹ kiếp", "bố láo", "láo toét", "láo lếu", "láo nháo", "láo xược", "láo cá", "láo toét",
  "phò", "gái gọi", "gái bán hoa", "gái điếm", "gái bao", "gái mại dâm", "trai bao", "trai gọi",
  "đồ ngu", "đồ chó", "đồ điên", "đồ khùng", "đồ rồ", "đồ dở", "đồ thần kinh", "đồ bẩn", "đồ rác",
  "bẩn bựa", "bẩn thỉu", "bẩn kinh", "bẩn kinh khủng", "bẩn kinh dị", "bẩn kinh tởm",
  "đồ khốn", "đồ khốn nạn", "đồ khốn kiếp", "đồ rác rưởi", "đồ bẩn thỉu",
  "đm", "vkl", "vcl", "cl", "cc", "dmm", "dmml", "dcm", "dmm", "dcmml", "dmmml",
  // Misspellings, leet speak, and obfuscations
  "djt", "djt me", "djt m", "djt con me", "djt bo", "djt ba", "djt cha", "djt cau", "djt cau ba", "djt cau me",
  "c*k", "c@k", "cak", "cak*", "cak@", "cak#", "cak!", "cak1", "cak3", "cak5", "cak9",
  "l*n", "l@n", "lon", "l0n", "l0*n", "l*n", "l*n1", "l*n3", "l*n5", "l*n9",
  "cho", "cho#", "ch0", "ch0#", "ch0!", "ch0*", "ch0@", "ch0^", "ch0$", "ch0%",
  "nguu", "ngụ", "nguuu", "nguuuu", "ngụu", "ngụuu", "ngụuuu", "nguu~", "ngụ~",
  "v~l", "v~c", "v~d", "v~kl", "v~cl", "v~cc", "v~đ", "v~ai", "v~ai l", "v~ai c",
  "djt", "djt m", "djt me", "djt cha", "djt ba", "djt bo", "djt cau", "djt cau ba", "djt cau me",
  "djtmm", "djtcm", "djtcc", "djtcl", "djtvl", "djtvc", "djtvd", "djtvkl", "djtvcl",
  "dmm", "dmml", "dcm", "dmm", "dcmml", "dmmml", "dm m", "dm me", "dm cha", "dm ba", "dm bo",
  "djt*", "djt@", "djt#", "djt!", "djt1", "djt3", "djt5", "djt9",
  "clm", "clml", "clmm", "clmlm", "clmmml", "clmmmlm", "clmmmlmm", "clmmmlmmm",
  "l0z", "l0zz", "l0zzz", "l0zzzz", "l0zzzzz", "l0zzzzzz", "l0zzzzzzz",
  "l*n", "l@n", "l*n1", "l*n3", "l*n5", "l*n9", "l@n1", "l@n3", "l@n5", "l@n9",
  "sh!t", "sh1t", "shlt", "sh*t", "sh@t", "sh#t", "sh!t!", "sh1t1", "shlt1", "sh*t1",
  "f*ck", "f@ck", "f#ck", "f!ck", "f1ck", "f*ck1", "f@ck1", "f#ck1", "f!ck1", "f1ck1",
  "b!tch", "b1tch", "b*tch", "b@tch", "b#tch", "b!tch1", "b1tch1", "b*tch1", "b@tch1", "b#tch1"
];

export function isToxicComment(comment: string): boolean {
  const normalized = comment.toLowerCase().normalize("NFC");
  return toxicWords.some(word => normalized.includes(word));
}