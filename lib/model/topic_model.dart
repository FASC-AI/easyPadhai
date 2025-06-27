class TopicModel {
  int? code;
  bool? status;
  String? message;
  Data? data;

  TopicModel({this.code, this.status, this.message, this.data});

  TopicModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new Data.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class Data {
  String? sId;
  String? topic;
  List<WordMeanings>? wordMeanings;
  String? lessonDescription;
  String? lessonTextContent;
  bool? isTestRequired;

  Data(
      {this.sId,
      this.topic,
      this.wordMeanings,
      this.lessonDescription,
      this.isTestRequired,
      this.lessonTextContent});

  Data.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    topic = json['topic'];
    if (json['wordMeanings'] != null) {
      wordMeanings = <WordMeanings>[];
      json['wordMeanings'].forEach((v) {
        wordMeanings!.add(new WordMeanings.fromJson(v));
      });
    }
    lessonDescription = json['lessonDescription'];
    lessonTextContent = json['lessonTextContent'];
    isTestRequired = json['isTestRequired'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['topic'] = this.topic;
    if (this.wordMeanings != null) {
      data['wordMeanings'] = this.wordMeanings!.map((v) => v.toJson()).toList();
    }
    data['lessonDescription'] = this.lessonDescription;
    data['lessonTextContent'] = this.lessonTextContent;
    data['isTestRequired'] = this.isTestRequired;
    return data;
  }
}

class WordMeanings {
  String? word;
  String? meaning;
  String? sId;

  WordMeanings({this.word, this.meaning, this.sId});

  WordMeanings.fromJson(Map<String, dynamic> json) {
    word = json['word'];
    meaning = json['meaning'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['word'] = this.word;
    data['meaning'] = this.meaning;
    data['_id'] = this.sId;
    return data;
  }
}
